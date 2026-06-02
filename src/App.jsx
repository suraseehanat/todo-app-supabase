import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import { Plus, Trash2, Check, Loader2, RefreshCw } from "lucide-react";

export default function App() {
  const [todos, setTodos] = useState([]);
  const [task, setTask] = useState("");
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
      .insert({ task: trimmed })
      .select()
      .single();
    if (error) setError(error.message);
    else {
      setTodos((t) => [data, ...t]);
      setTask("");
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

  const remaining = todos.filter((t) => !t.is_done).length;

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

        <div className="flex gap-2 mb-4">
          <input
            value={task}
            onChange={(e) => setTask(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTodo()}
            placeholder="เพิ่มงานใหม่..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 text-slate-700"
          />
          <button
            onClick={addTodo}
            disabled={adding || !task.trim()}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 transition flex items-center"
          >
            {adding ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
          </button>
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
        ) : todos.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            ยังไม่มีงาน — เพิ่มงานแรกของคุณเลย
          </div>
        ) : (
          <ul className="space-y-2">
            {todos.map((todo) => (
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
                <span
                  className={`flex-1 text-slate-700 ${
                    todo.is_done ? "line-through text-slate-400" : ""
                  }`}
                >
                  {todo.task}
                </span>
                <button
                  onClick={() => remove(todo.id)}
                  className="text-slate-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
