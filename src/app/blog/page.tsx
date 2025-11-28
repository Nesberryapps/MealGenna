
import { generateBlogPost } from '@/ai/flows/generate-blog-post-flow';
import { generateBlogTopics } from '@/ai/flows/generate-blog-topics-flow';
import type { BlogPost } from '@/ai/flows/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Heart, Brain, Droplets, Footprints, ShieldCheck, Smile, Wind, LucideProps } from 'lucide-react';
import { ForwardRefExoticComponent, RefAttributes } from 'react';
import AdBanner from '@/components/ad-banner';

// Re-generate this page once a day (86400 seconds). This enables Incremental Static Regeneration (ISR).
export const revalidate = 86400;

// Map icon names to actual Lucide components
const iconMap: { [key: string]: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>> } = {
    Heart,
    Brain,
    Droplets,
    Lightbulb,
    Footprints,
    ShieldCheck,
    Smile,
    Wind
};

// This is a React Server Component, so it can be async.
export default async function BlogPage() {

    let blogPosts: (BlogPost & { icon: React.ReactNode })[] = [];

    try {
        // Step 1: Generate a list of fresh topics
        const blogTopics = await generateBlogTopics();

        // Step 2: Generate a blog post for each topic
        const postPromises = blogTopics.map(async (item) => {
            const post = await generateBlogPost(item.topic);
            const IconComponent = iconMap[item.icon] || Lightbulb; // Default to Lightbulb if icon is invalid
            return { ...post, icon: <IconComponent className="h-6 w-6" /> };
        });
        blogPosts = await Promise.all(postPromises);

    } catch (error) {
        console.error("Failed to generate blog posts:", error);
        // We'll render an error message on the page.
    }

    return (
        <div className="container py-12 md:py-20">
            <div className="mx-auto max-w-3xl text-center mb-12">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">MealGenna Insights</h1>
                <p className="mt-4 text-muted-foreground md:text-xl">
                    Quick reads on health, wellness, and nutrition to inspire a better you. Freshly generated for you daily.
                </p>
            </div>

            {blogPosts.length > 0 ? (
                <div className="grid gap-8 max-w-3xl mx-auto">
                    {blogPosts.map((post, index) => (
                        <Card key={index} className="flex flex-col">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <CardTitle className="text-2xl">{post.title}</CardTitle>
                                    <div className="p-2 bg-primary/10 text-primary rounded-full">
                                        {post.icon}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4 text-muted-foreground flex-1">
                                {post.content.map((paragraph, pIndex) => (
                                    <p key={pIndex}>{paragraph}</p>
                                ))}
                            </CardContent>
                             <CardContent>
                                <Badge variant="outline">{post.summary}</Badge>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                 <div className="max-w-3xl mx-auto text-center">
                    <Card className="p-8">
                        <CardTitle className="text-xl text-destructive">Oops! Something went wrong.</CardTitle>
                        <CardDescription className="mt-2">
                            We couldn't generate fresh blog posts for you right now. Please try again later.
                        </CardDescription>
                    </Card>
                </div>
            )}
            <section className="w-full pt-12 md:pt-24 lg:pt-32">
                <div className="container">
                    <AdBanner />
                </div>
            </section>
        </div>
    );
}
