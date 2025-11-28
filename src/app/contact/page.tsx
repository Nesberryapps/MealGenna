
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Send } from 'lucide-react';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [feedbackType, setFeedbackType] = useState('');
  const [message, setMessage] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackType || !message) {
      toast({
        variant: 'destructive',
        title: 'Missing Fields',
        description: 'Please select a feedback type and enter a message.',
      });
      return;
    }

    const subject = `Feedback from ${name || 'a User'}: ${feedbackType}`;
    let body = `New feedback received from MealGenna:\n\n`;
    body += `Type: ${feedbackType}\n`;
    if (name) body += `Name: ${name}\n`;
    if (email) body += `Email: ${email}\n`;
    body += `\nMessage:\n${message}`;
    
    const mailtoLink = `mailto:support@mealgenna.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    window.location.href = mailtoLink;

    toast({
      title: 'Opening Email Client',
      description: "Please send the pre-filled email from your mail application.",
    });

    // Reset form after a short delay
    setTimeout(() => {
        setName('');
        setEmail('');
        setFeedbackType('');
        setMessage('');
    }, 1000);
  };

  return (
    <div className="container py-12 md:py-20">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl">Submit Feedback</CardTitle>
          <CardDescription>
            Have a bug to report, a feature request, or general feedback? Fill out the form below to open a pre-filled email in your default mail client.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Name (Optional)</Label>
                <Input 
                  id="name" 
                  placeholder="Your Name" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Your Reply-To Email (Optional)</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="your@email.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="feedback-type">Type of Feedback</Label>
              <Select value={feedbackType} onValueChange={setFeedbackType}>
                <SelectTrigger id="feedback-type">
                  <SelectValue placeholder="Select a type..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bug Report">Bug Report</SelectItem>
                  <SelectItem value="Feature Request">Feature Request</SelectItem>
                  <SelectItem value="General Feedback">General Feedback</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea 
                id="message" 
                placeholder="Tell us what's on your mind..." 
                className="min-h-[120px]"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit">
                <Send className="mr-2 h-4 w-4" />
                Prepare Email
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
