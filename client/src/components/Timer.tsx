import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Play, Pause, Square, Clock, Timer } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Subject } from "@shared/schema";

interface TimerProps {
  initialMinutes?: number;
}

export default function Timer({ initialMinutes = 25 }: TimerProps) {
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showStopDialog, setShowStopDialog] = useState(false);
  const [pomodoroMode, setPomodoroMode] = useState(false);
  const [pomodoroTime, setPomodoroTime] = useState(25);
  const [sessionForm, setSessionForm] = useState({
    subjectId: "",
    notes: "",
    reason: "",
  });
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const { toast } = useToast();

  const { data: subjects = [] } = useQuery<Subject[]>({
    queryKey: ["/api/subjects"],
  });

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getPomodoroProgress = () => {
    if (!pomodoroMode) return 0;
    const targetSeconds = pomodoroTime * 60;
    return Math.min((timeElapsed / targetSeconds) * 100, 100);
  };

  const isPomodoroComplete = () => {
    return pomodoroMode && timeElapsed >= pomodoroTime * 60;
  };

  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        setTimeElapsed((prevTime) => {
          const newTime = prevTime + 1;
          
          // Auto-complete Pomodoro session
          if (pomodoroMode && newTime >= pomodoroTime * 60) {
            setIsRunning(false);
            setIsPaused(false);
            setShowStopDialog(true);
            toast({
              title: "Pomodoro Complete!",
              description: `Great work! You've completed your ${pomodoroTime} minute session.`,
            });
            return newTime;
          }
          
          return newTime;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isPaused, pomodoroMode, pomodoroTime]);

  const handleStart = () => {
    setIsRunning(true);
    setIsPaused(false);
    if (!startTimeRef.current) {
      startTimeRef.current = Date.now();
    }
  };

  const handlePause = () => {
    setIsPaused(true);
  };

  const handleResume = () => {
    setIsPaused(false);
  };

  const handleStop = () => {
    setShowStopDialog(true);
  };

  const handleStopConfirm = async () => {
    try {
      if (!sessionForm.subjectId) {
        toast({
          title: "Error",
          description: "Please select a subject for this session.",
          variant: "destructive",
        });
        return;
      }

      const studyDuration = Math.floor(timeElapsed / 60);
      
      if (studyDuration < 1) {
        toast({
          title: "Error", 
          description: "Session must be at least 1 minute to save.",
          variant: "destructive",
        });
        return;
      }

      const sessionData = {
        subjectId: parseInt(sessionForm.subjectId),
        duration: studyDuration,
        notes: sessionForm.notes || null,
        date: new Date().toISOString(),
      };

      await apiRequest("/api/study-sessions", {
        method: "POST",
        body: sessionData,
      });

      queryClient.invalidateQueries({ queryKey: ["/api/study-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/summary"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/study-sessions/date-range"] });

      console.log("Session saved:", sessionData);
      
      toast({
        title: "Session saved!",
        description: `Studied ${studyDuration} minutes of ${subjects.find(s => s.id === parseInt(sessionForm.subjectId))?.name}`,
      });

      // Reset timer
      setTimeElapsed(0);
      setIsRunning(false);
      setIsPaused(false);
      setShowStopDialog(false);
      setSessionForm({ subjectId: "", notes: "", reason: "" });
      startTimeRef.current = null;
    } catch (error) {
      console.error("Failed to save session:", error);
      toast({
        title: "Error",
        description: "Failed to save study session",
        variant: "destructive",
      });
    }
  };

  const handleStopCancel = () => {
    setShowStopDialog(false);
  };

  const getTimerStatus = () => {
    if (!isRunning && timeElapsed === 0) return "Ready to start";
    if (isRunning && !isPaused) return "Running";
    if (isPaused) return "Paused";
    if (isPomodoroComplete()) return "Pomodoro Complete!";
    return "Stopped";
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center flex items-center justify-center gap-2">
          <Clock className="w-5 h-5" />
          Study Timer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <div className="text-6xl font-mono font-bold text-blue-600 mb-2">
            {formatTime(timeElapsed)}
          </div>
          <div className="text-sm text-gray-600 mb-4">
            Status: {getTimerStatus()}
          </div>
          
          {pomodoroMode && (
            <div className="mb-4">
              <div className="text-sm text-gray-600 mb-2">
                Pomodoro Progress ({pomodoroTime} min)
              </div>
              <Progress value={getPomodoroProgress()} className="h-2" />
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="pomodoro-mode"
              checked={pomodoroMode}
              onCheckedChange={setPomodoroMode}
              disabled={isRunning}
            />
            <Label htmlFor="pomodoro-mode" className="text-sm">
              <Timer className="w-4 h-4 inline mr-1" />
              Pomodoro Mode
            </Label>
          </div>
          
          {pomodoroMode && !isRunning && (
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                value={pomodoroTime}
                onChange={(e) => setPomodoroTime(Math.max(1, parseInt(e.target.value) || 25))}
                min="1"
                max="60"
                className="w-16 h-8 text-center"
              />
              <span className="text-sm text-gray-600">min</span>
            </div>
          )}
        </div>

        <div className="flex justify-center gap-2">
          {!isRunning ? (
            <Button onClick={handleStart} className="flex items-center gap-2">
              <Play className="w-4 h-4" />
              Start
            </Button>
          ) : (
            <>
              {isPaused ? (
                <Button onClick={handleResume} className="flex items-center gap-2">
                  <Play className="w-4 h-4" />
                  Resume
                </Button>
              ) : (
                <Button onClick={handlePause} variant="outline" className="flex items-center gap-2">
                  <Pause className="w-4 h-4" />
                  Pause
                </Button>
              )}
              <Button onClick={handleStop} variant="destructive" className="flex items-center gap-2">
                <Square className="w-4 h-4" />
                Stop
              </Button>
            </>
          )}
        </div>
      </CardContent>

      <Dialog open={showStopDialog} onOpenChange={setShowStopDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Study Session</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">Why are you stopping?</Label>
              <Select 
                value={sessionForm.reason} 
                onValueChange={(value) => setSessionForm(prev => ({ ...prev, reason: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="completed">Session completed</SelectItem>
                  <SelectItem value="break">Taking a break</SelectItem>
                  <SelectItem value="distracted">Got distracted</SelectItem>
                  <SelectItem value="difficult">Material too difficult</SelectItem>
                  <SelectItem value="tired">Feeling tired</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Select 
                value={sessionForm.subjectId} 
                onValueChange={(value) => setSessionForm(prev => ({ ...prev, subjectId: value }))}
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
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="What did you study? Any thoughts or key points..."
                value={sessionForm.notes}
                onChange={(e) => setSessionForm(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
              />
            </div>
            
            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
              <strong>Session Summary:</strong><br/>
              Duration: {formatTime(timeElapsed)} ({Math.floor(timeElapsed / 60)} minutes)<br/>
              {pomodoroMode && isPomodoroComplete() && "✅ Pomodoro completed!"}
            </div>
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={handleStopCancel}>
                Cancel
              </Button>
              <Button onClick={handleStopConfirm}>
                Save Session
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}