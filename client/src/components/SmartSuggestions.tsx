import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, X } from "lucide-react";
import { useState } from "react";
import type { StudySession, Subject } from "@shared/schema";

export default function SmartSuggestions() {
  const [dismissed, setDismissed] = useState(false);

  const { data: sessions = [] } = useQuery<(StudySession & { subject: Subject })[]>({
    queryKey: ["/api/study-sessions"],
  });

  const { data: subjects = [] } = useQuery<Subject[]>({
    queryKey: ["/api/subjects"],
  });

  const getSuggestion = () => {
    if (sessions.length === 0 || subjects.length === 0) return null;

    // Get sessions from the last 7 days
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const recentSessions = sessions.filter(session => 
      new Date(session.date!) >= oneWeekAgo
    );

    // Calculate total time per subject
    const subjectTimes = subjects.map(subject => {
      const totalMinutes = recentSessions
        .filter(session => session.subjectId === subject.id)
        .reduce((sum, session) => sum + session.duration, 0);
      
      return {
        subject,
        totalMinutes,
        percentage: 0
      };
    });

    const totalMinutes = subjectTimes.reduce((sum, item) => sum + item.totalMinutes, 0);
    
    if (totalMinutes === 0) return null;

    // Calculate percentages
    subjectTimes.forEach(item => {
      item.percentage = (item.totalMinutes / totalMinutes) * 100;
    });

    // Find subjects with less than 20% of total time
    const laggedSubjects = subjectTimes.filter(item => item.percentage < 20 && item.percentage > 0);
    
    if (laggedSubjects.length === 0) return null;

    // Return the subject with the lowest percentage
    const mostLaggedSubject = laggedSubjects.reduce((min, item) => 
      item.percentage < min.percentage ? item : min
    );

    return mostLaggedSubject;
  };

  const suggestion = getSuggestion();

  if (!suggestion || dismissed) return null;

  return (
    <Card className="mb-6 border-orange-200 bg-orange-50">
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <Lightbulb className="w-5 h-5 text-orange-600 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-medium text-slate-800">Smart Suggestion</h3>
            <p className="text-sm text-slate-600">
              You're lagging in <strong>{suggestion.subject.name}</strong> — consider adding a session today.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDismissed(true)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
