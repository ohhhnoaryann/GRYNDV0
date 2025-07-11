import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, BookOpen } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Subject } from "@shared/schema";

const predefinedColors = [
  "#2563eb", "#dc2626", "#059669", "#d97706", "#7c3aed", 
  "#db2777", "#0891b2", "#65a30d", "#ea580c", "#9333ea"
];

export default function SubjectsPage() {
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [subjectForm, setSubjectForm] = useState({
    name: "",
    color: predefinedColors[0],
  });
  const { toast } = useToast();

  const { data: subjects = [] } = useQuery<Subject[]>({
    queryKey: ["/api/subjects"],
  });

  const createSubjectMutation = useMutation({
    mutationFn: async (data: { name: string; color: string }) => {
      const response = await apiRequest("POST", "/api/subjects", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subjects"] });
      toast({
        title: "Subject created!",
        description: "Your new subject has been added.",
      });
      setIsAddingSubject(false);
      resetForm();
    },
  });

  const updateSubjectMutation = useMutation({
    mutationFn: async (data: { id: number; name: string; color: string }) => {
      const response = await apiRequest("PUT", `/api/subjects/${data.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subjects"] });
      toast({
        title: "Subject updated!",
        description: "Your subject has been updated.",
      });
      setEditingSubject(null);
      resetForm();
    },
  });

  const deleteSubjectMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/subjects/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subjects"] });
      toast({
        title: "Subject deleted!",
        description: "Your subject has been removed.",
      });
    },
  });

  const resetForm = () => {
    setSubjectForm({
      name: "",
      color: predefinedColors[0],
    });
  };

  const handleSubmit = () => {
    if (!subjectForm.name.trim()) {
      toast({
        title: "Missing name",
        description: "Please enter a subject name.",
        variant: "destructive",
      });
      return;
    }

    const data = {
      name: subjectForm.name.trim(),
      color: subjectForm.color,
    };

    if (editingSubject) {
      updateSubjectMutation.mutate({ id: editingSubject.id, ...data });
    } else {
      createSubjectMutation.mutate(data);
    }
  };

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setSubjectForm({
      name: subject.name,
      color: subject.color,
    });
    setIsAddingSubject(true);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Subjects</CardTitle>
              <Dialog open={isAddingSubject} onOpenChange={setIsAddingSubject}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Subject
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingSubject ? "Edit Subject" : "Add New Subject"}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Subject Name</Label>
                      <Input
                        id="name"
                        placeholder="Enter subject name"
                        value={subjectForm.name}
                        onChange={(e) => setSubjectForm(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="color">Color</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {predefinedColors.map((color) => (
                          <button
                            key={color}
                            type="button"
                            className={`w-8 h-8 rounded-full border-2 transition-all ${
                              subjectForm.color === color
                                ? "border-slate-800 scale-110"
                                : "border-slate-300 hover:border-slate-400"
                            }`}
                            style={{ backgroundColor: color }}
                            onClick={() => setSubjectForm(prev => ({ ...prev, color }))}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <Button variant="outline" onClick={() => {
                        setIsAddingSubject(false);
                        setEditingSubject(null);
                        resetForm();
                      }}>
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleSubmit}
                        disabled={createSubjectMutation.isPending || updateSubjectMutation.isPending}
                      >
                        {createSubjectMutation.isPending || updateSubjectMutation.isPending 
                          ? "Saving..." 
                          : editingSubject ? "Update Subject" : "Create Subject"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {subjects.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-500">No subjects yet.</p>
                <p className="text-sm text-slate-400 mt-2">
                  Add your first subject to get started with studying.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {subjects.map((subject) => (
                  <Card key={subject.id} className="relative">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: subject.color }}
                          />
                          <span className="font-medium text-slate-800">
                            {subject.name}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(subject)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteSubjectMutation.mutate(subject.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
