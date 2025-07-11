import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import VideoPlayer from "@/components/VideoPlayer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Play, BookOpen, Clock } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Playlist, Subject } from "@shared/schema";

interface VideoItem {
  id: string;
  title: string;
  duration: number;
  thumbnailUrl: string;
  videoUrl: string;
  watched: boolean;
}

// Mock video data for demonstration
const mockVideos: VideoItem[] = [
  {
    id: "1",
    title: "Introduction to Classical Mechanics",
    duration: 1800, // 30 minutes
    thumbnailUrl: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    watched: false
  },
  {
    id: "2",
    title: "Newton's Laws of Motion",
    duration: 2400, // 40 minutes
    thumbnailUrl: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    watched: false
  },
  {
    id: "3",
    title: "Work and Energy",
    duration: 2100, // 35 minutes
    thumbnailUrl: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    watched: false
  }
];

export default function VideoLearningPage() {
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);
  const [isAddingPlaylist, setIsAddingPlaylist] = useState(false);
  const [playlistForm, setPlaylistForm] = useState({
    name: "",
    url: "",
    subjectId: "",
  });
  const { toast } = useToast();

  const { data: playlists = [] } = useQuery<(Playlist & { subject: Subject })[]>({
    queryKey: ["/api/playlists"],
  });

  const { data: subjects = [] } = useQuery<Subject[]>({
    queryKey: ["/api/subjects"],
  });

  const handlePlaylistSelect = (playlistId: string) => {
    setSelectedPlaylist(playlistId);
  };

  const handleBackToPlaylists = () => {
    setSelectedPlaylist(null);
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const getTotalDuration = (videos: VideoItem[]) => {
    return videos.reduce((sum, video) => sum + video.duration, 0);
  };

  if (selectedPlaylist) {
    const playlist = playlists.find(p => p.id.toString() === selectedPlaylist);
    if (playlist) {
      return (
        <VideoPlayer
          playlistId={selectedPlaylist}
          playlistName={playlist.name}
          videos={mockVideos}
        />
      );
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Video Learning</h1>
            <p className="text-slate-600">Study with curated video playlists</p>
          </div>
          <Dialog open={isAddingPlaylist} onOpenChange={setIsAddingPlaylist}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Playlist
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Playlist</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="playlist-name">Playlist Name</Label>
                  <Input
                    id="playlist-name"
                    placeholder="Enter playlist name"
                    value={playlistForm.name}
                    onChange={(e) => setPlaylistForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="playlist-url">YouTube Playlist URL</Label>
                  <Input
                    id="playlist-url"
                    placeholder="https://youtube.com/playlist?list=..."
                    value={playlistForm.url}
                    onChange={(e) => setPlaylistForm(prev => ({ ...prev, url: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Select 
                    value={playlistForm.subjectId} 
                    onValueChange={(value) => setPlaylistForm(prev => ({ ...prev, subjectId: value }))}
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
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setIsAddingPlaylist(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => {
                    // Add playlist logic here
                    toast({
                      title: "Playlist added!",
                      description: "Your playlist has been created.",
                    });
                    setIsAddingPlaylist(false);
                  }}>
                    Add Playlist
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {playlists.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-800 mb-2">No playlists yet</h3>
              <p className="text-slate-600 mb-4">
                Add your first YouTube playlist to start learning
              </p>
              <Button onClick={() => setIsAddingPlaylist(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Playlist
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {playlists.map((playlist) => (
              <Card key={playlist.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{playlist.name}</CardTitle>
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: playlist.subject.color }}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm text-slate-600">
                      <span>{playlist.subject.name}</span>
                      <span>{mockVideos.length} videos</span>
                    </div>
                    <div className="flex items-center text-sm text-slate-600">
                      <Clock className="w-4 h-4 mr-1" />
                      {formatDuration(getTotalDuration(mockVideos))}
                    </div>
                    <Button 
                      className="w-full"
                      onClick={() => handlePlaylistSelect(playlist.id.toString())}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Start Learning
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}