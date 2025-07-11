import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Play, Pause, SkipForward, SkipBack, Clock, CheckCircle } from "lucide-react";

interface VideoItem {
  id: string;
  title: string;
  duration: number; // in seconds
  thumbnailUrl: string;
  videoUrl: string;
  watched: boolean;
}

interface VideoPlayerProps {
  playlistId: string;
  playlistName: string;
  videos: VideoItem[];
}

export default function VideoPlayer({ playlistId, playlistName, videos }: VideoPlayerProps) {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [watchedVideos, setWatchedVideos] = useState<Set<string>>(new Set());
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const currentVideo = videos[currentVideoIndex];
  const totalVideos = videos.length;
  const watchedCount = watchedVideos.size;
  const completionPercentage = (watchedCount / totalVideos) * 100;
  
  const totalDuration = videos.reduce((sum, video) => sum + video.duration, 0);
  const watchedDuration = videos
    .filter(video => watchedVideos.has(video.id))
    .reduce((sum, video) => sum + video.duration, 0);
  const remainingDuration = totalDuration - watchedDuration;

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVideoComplete = (videoId: string) => {
    setWatchedVideos(prev => new Set([...prev, videoId]));
  };

  const handleNextVideo = () => {
    if (currentVideoIndex < videos.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
      setIsPlaying(false);
    }
  };

  const handlePreviousVideo = () => {
    if (currentVideoIndex > 0) {
      setCurrentVideoIndex(currentVideoIndex - 1);
      setIsPlaying(false);
    }
  };

  const handleVideoSelect = (index: number) => {
    setCurrentVideoIndex(index);
    setIsPlaying(false);
  };

  const extractYouTubeId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
    return match ? match[1] : null;
  };

  const youtubeId = extractYouTubeId(currentVideo?.videoUrl || '');

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">{playlistName}</h1>
          <div className="flex items-center space-x-4 text-sm text-slate-400">
            <span>{totalVideos} videos</span>
            <span>•</span>
            <span>{formatDuration(totalDuration)} total</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Video Player */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-0">
                <div className="relative aspect-video bg-black rounded-t-lg overflow-hidden">
                  {youtubeId ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${youtubeId}?autoplay=${isPlaying ? 1 : 0}&rel=0&modestbranding=1`}
                      className="w-full h-full"
                      allowFullScreen
                      title={currentVideo?.title}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-700">
                      <Play className="w-16 h-16 text-slate-400" />
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2 text-white">
                    {currentVideo?.title || 'Select a video'}
                  </h3>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePreviousVideo}
                        disabled={currentVideoIndex === 0}
                        className="bg-slate-700 border-slate-600 hover:bg-slate-600"
                      >
                        <SkipBack className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="bg-slate-700 border-slate-600 hover:bg-slate-600"
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleNextVideo}
                        disabled={currentVideoIndex === videos.length - 1}
                        className="bg-slate-700 border-slate-600 hover:bg-slate-600"
                      >
                        <SkipForward className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-400">
                        {formatDuration(currentVideo?.duration || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats Panel */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-300">Completion</span>
                    <span className="text-white">{Math.round(completionPercentage)}%</span>
                  </div>
                  <Progress value={completionPercentage} className="h-2" />
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-400">Watched</span>
                    <p className="text-white font-medium">{watchedCount}/{totalVideos}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Time Left</span>
                    <p className="text-white font-medium">{formatDuration(remainingDuration)}</p>
                  </div>
                </div>
                
                <div>
                  <span className="text-slate-400">Total Duration</span>
                  <p className="text-white font-medium">{formatDuration(totalDuration)}</p>
                </div>
              </CardContent>
            </Card>

            {/* Playlist Panel */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Playlist</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-96">
                  <div className="p-4 space-y-2">
                    {videos.map((video, index) => (
                      <div
                        key={video.id}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          index === currentVideoIndex
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                        }`}
                        onClick={() => handleVideoSelect(index)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <img
                              src={video.thumbnailUrl}
                              alt={video.title}
                              className="w-16 h-12 object-cover rounded"
                            />
                            {watchedVideos.has(video.id) && (
                              <CheckCircle className="absolute -top-1 -right-1 w-4 h-4 text-green-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate text-sm">
                              {video.title}
                            </p>
                            <p className="text-xs text-slate-400">
                              {formatDuration(video.duration)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}