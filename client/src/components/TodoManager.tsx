import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Calendar } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Todo, Subject } from "@shared/schema";

export default function TodoManager() {
  const [isAddingTodo, setIsAddingTodo] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [todoForm, setTodoForm] = useState({
    task: "",
    subjectId: "",
    dueDate: "",
  });
  const { toast } = useToast();

  const { data: todos = [] } = useQuery<(Todo & { subject: Subject })[]>({
    queryKey: ["/api/todos"],
  });

  const { data: subjects = [] } = useQuery<Subject[]>({
    queryKey: ["/api/subjects"],
  });

  const createTodoMutation = useMutation({
    mutationFn: async (data: { task: string; subjectId: number; dueDate?: string }) => {
      const response = await apiRequest("POST", "/api/todos", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/todos"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Task added!",
        description: "Your new task has been created.",
      });
      setIsAddingTodo(false);
      resetForm();
    },
  });

  const updateTodoMutation = useMutation({
    mutationFn: async (data: { id: number; task?: string; subjectId?: number; status?: string; dueDate?: string }) => {
      const response = await apiRequest("PUT", `/api/todos/${data.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/todos"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Task updated!",
        description: "Your task has been updated.",
      });
      setEditingTodo(null);
      resetForm();
    },
  });

  const deleteTodoMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/todos/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/todos"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Task deleted!",
        description: "Your task has been removed.",
      });
    },
  });

  const resetForm = () => {
    setTodoForm({
      task: "",
      subjectId: "",
      dueDate: "",
    });
  };

  const handleSubmit = () => {
    if (!todoForm.task.trim() || !todoForm.subjectId) {
      toast({
        title: "Missing information",
        description: "Please enter a task and select a subject.",
        variant: "destructive",
      });
      return;
    }

    const data = {
      task: todoForm.task.trim(),
      subjectId: parseInt(todoForm.subjectId),
      dueDate: todoForm.dueDate || undefined,
    };

    if (editingTodo) {
      updateTodoMutation.mutate({ id: editingTodo.id, ...data });
    } else {
      createTodoMutation.mutate(data);
    }
  };

  const handleToggleComplete = (todo: Todo) => {
    const newStatus = todo.status === "completed" ? "pending" : "completed";
    updateTodoMutation.mutate({
      id: todo.id,
      status: newStatus,
    });
  };

  const handleEdit = (todo: Todo & { subject: Subject }) => {
    setEditingTodo(todo);
    setTodoForm({
      task: todo.task,
      subjectId: todo.subjectId.toString(),
      dueDate: todo.dueDate || "",
    });
  };

  const formatDueDate = (dateString: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString();
    }
  };

  const getSubjectColor = (subjectId: number) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject?.color || "#2563eb";
  };

  const pendingTodos = todos.filter(todo => todo.status === "pending");
  const completedTodos = todos.filter(todo => todo.status === "completed");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>To-Do Manager</CardTitle>
            <Dialog open={isAddingTodo} onOpenChange={setIsAddingTodo}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Task
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingTodo ? "Edit Task" : "Add New Task"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="task">Task</Label>
                    <Input
                      id="task"
                      placeholder="Enter task description"
                      value={todoForm.task}
                      onChange={(e) => setTodoForm(prev => ({ ...prev, task: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Select 
                      value={todoForm.subjectId} 
                      onValueChange={(value) => setTodoForm(prev => ({ ...prev, subjectId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((subject) => (
                          <SelectItem key={subject.id} value={subject.id.toString()}>
                            {subject.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="dueDate">Due Date (optional)</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={todoForm.dueDate}
                      onChange={(e) => setTodoForm(prev => ({ ...prev, dueDate: e.target.value }))}
                    />
                  </div>
                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => {
                      setIsAddingTodo(false);
                      setEditingTodo(null);
                      resetForm();
                    }}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSubmit}
                      disabled={createTodoMutation.isPending || updateTodoMutation.isPending}
                    >
                      {createTodoMutation.isPending || updateTodoMutation.isPending ? "Saving..." : "Save Task"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {todos.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-500">No tasks yet.</p>
              <p className="text-sm text-slate-400 mt-2">
                Add your first task to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {pendingTodos.length > 0 && (
                <div>
                  <h3 className="font-medium text-slate-700 mb-3">Pending Tasks</h3>
                  <div className="space-y-2">
                    {pendingTodos.map((todo) => (
                      <div key={todo.id} className="flex items-center space-x-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                        <Checkbox
                          checked={todo.status === "completed"}
                          onCheckedChange={() => handleToggleComplete(todo)}
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-800">
                              {todo.task}
                            </span>
                            <Badge 
                              variant="secondary" 
                              style={{ backgroundColor: `${getSubjectColor(todo.subjectId)}20`, color: getSubjectColor(todo.subjectId) }}
                            >
                              {todo.subject.name}
                            </Badge>
                          </div>
                          {todo.dueDate && (
                            <div className="text-xs text-slate-600 mt-1 flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              Due: {formatDueDate(todo.dueDate)}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              handleEdit(todo);
                              setIsAddingTodo(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteTodoMutation.mutate(todo.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {completedTodos.length > 0 && (
                <div>
                  <h3 className="font-medium text-slate-700 mb-3">Completed Tasks</h3>
                  <div className="space-y-2">
                    {completedTodos.map((todo) => (
                      <div key={todo.id} className="flex items-center space-x-3 p-3 border border-slate-200 rounded-lg bg-slate-50">
                        <Checkbox
                          checked={todo.status === "completed"}
                          onCheckedChange={() => handleToggleComplete(todo)}
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-800 line-through opacity-60">
                              {todo.task}
                            </span>
                            <Badge 
                              variant="secondary" 
                              style={{ backgroundColor: `${getSubjectColor(todo.subjectId)}20`, color: getSubjectColor(todo.subjectId) }}
                            >
                              {todo.subject.name}
                            </Badge>
                          </div>
                          <div className="text-xs text-slate-600 mt-1">
                            Completed
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteTodoMutation.mutate(todo.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
