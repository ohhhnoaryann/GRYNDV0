import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/Dashboard";
import Analytics from "@/pages/Analytics";
import Goals from "@/pages/Goals";
import Todos from "@/pages/Todos";
import History from "@/pages/History";
import Subjects from "@/pages/Subjects";
import VideoLearning from "@/pages/VideoLearning";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/goals" component={Goals} />
      <Route path="/todos" component={Todos} />
      <Route path="/history" component={History} />
      <Route path="/subjects" component={Subjects} />
      <Route path="/video-learning" component={VideoLearning} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
