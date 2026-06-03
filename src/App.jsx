import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import { Plus, Trash2, Check, Loader2, RefreshCw, Calendar, Tag } from "lucide-react";

const CATEGORIES = ["ทั่วไป", "งาน", "ส่วนตัว", "ช้อปปิ้ง", "สุขภาพ"];

const CATEGORY_COLORS = {
  "ทั่วไป": "bg-slate-100 text-slate-600",
  "งาน": "bg-blue-100 text-blue-700",
  "ส่วนตัว": "bg-purple-100 text-purple-700",
  "ช้อปปิ้ง": "bg-amber-100 text-amber-700",
  "สุขภาพ": "bg-emerald-100 text-emerald-700",
};

function formatDate(d) {
  if (!d) return null;
  return new Date(d).toLocaleDateString("th-TH", { day: "numeric", month: "short" });
}

function isOverdue(d, done) {
  if (!d || done) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(d) < today;
}

export default function App() {
  const [todos, setTodos] = useState([]);
  const [task, setTask] = useState("");
  const [category, setCategory] = useState("ทั่วไป");
  const [dueDate, setDueDate] = useState("");
  const [filter, setFilter] = useState("ทั้งหมด");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState(null);

  async function load() {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("todos")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) setError(error.message);
    else setTodos(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function addTodo() {
    const trimmed = task.trim();
    if (!trimmed) return;
    setAdding(true);
    setError(null);
    const { data, error } = await supabase
      .from("todos")
      .insert({ task: trimmed, category, due_date: dueDate || null })
      .select()
      .single();
    if (error) setError(error.message);
    else {
      setTodos((t) => [data, ...t]);
      setTask("");
      setDueDate("");
    }
    setAdding(false);
  }

  async function toggle(todo) {
    const { data, error } = await supabase
      .from("todos")
      .update({ is_done: !todo.is_done })
      .eq("id", todo.id)
      .select()
      .single();
    if (error) setError(error.message);
    else setTodos((t) => t.map((x) => (x.id === todo.id ? data : x)));
  }

  async function remove(id) {
    const { error } = await supabase.from("todos").delete().eq("id", id);
    if (error) setError(error.message);
    else setTodos((t) => t.filter((x) => x.id !== id));
  }

  const visible =
    filter === "ทั้งหมด" ? todos : todos.filter((t) => t.category === filter);
  const remaining = visible.filter((t) => !t.is_done).length;

  return (
    <div className="min-h-screen bg-slate-50 flex justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl font-semibold text-slate-800">My Todos</h1>
          <button
            onClick={load}
            className="text-slate-400 hover:text-slate-600 transition"
            title="Reload from DB"
          >
            <RefreshCw size={18} />
          </button>
        </div>
        <p className="text-sm text-slate-400 mb-6">
          เชื่อมต่อ Supabase จริง · เหลือ {remaining} งาน
        </p>

        <div className="bg-white rounded-2xl border border-slate-100 p-3 mb-4 space-y-2">
          <input
            value={task}
            onChange={(e) => setTask(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTodo()}
            placeholder="เพิ่มงานใหม่..."
            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 text-slate-700"
          />
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Tag size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full pl-8 pr-2 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 appearance-none"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="relative flex-1">
              <Calendar size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full pl-8 pr-2 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
            <button
              onClick={addTodo}
              disabled={adding || !task.trim()}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 transition flex items-center shrink-0"
            >
              {adding ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
            </button>
          </div>
        </div>

        <div className="flex gap-1.5 mb-4 flex-wrap">
          {["ทั้งหมด", ...CATEGORIES].map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                filter === c
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-slate-500 border border-slate-200 hover:border-indigo-300"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 px-4 py-2.5 rounded-xl bg-red-50 text-red-600 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12 text-slate-400">
            <Loader2 size={24} className="animate-spin" />
          </div>
        ) : visible.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            ไม่มีงานในหมวดนี้
          </div>
        ) : (
          <ul className="space-y-2">
            {visible.map((todo) => {
              const overdue = isOverdue(todo.due_date, todo.is_done);
              return (
                <li
                  key={todo.id}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-slate-100 group"
                >
                  <button
                    onClick={() => toggle(todo)}
                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition shrink-0 ${
                      todo.is_done
                        ? "bg-indigo-600 border-indigo-600"
                        : "border-slate-300 hover:border-indigo-400"
                    }`}
                  >
                    {todo.is_done && <Check size={14} className="text-white" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <span
                      className={`block text-slate-700 truncate ${
                        todo.is_done ? "line-through text-slate-400" : ""
                      }`}
                    >
                      {todo.task}
                    </span>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-full ${
                          CATEGORY_COLORS[todo.category] || CATEGORY_COLORS["ทั่วไป"]
                        }`}
                      >
                        {todo.category}
                      </span>
                      {todo.due_date && (
                        <span
                          className={`text-[11px] flex items-center gap-0.5 ${
                            overdue ? "text-red-500 font-medium" : "text-slate-400"
                          }`}
                        >
                          <Calendar size={11} />
                          {formatDate(todo.due_date)}
                          {overdue && " · เลยกำหนด"}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => remove(todo.id)}
                    className="text-slate-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100 shrink-0"
                  >
                    <Trash2 size={16} />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
