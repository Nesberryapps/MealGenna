
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function BlogLoading() {
  return (
    <div className="container py-12 md:py-20">
        <div className="mx-auto max-w-3xl text-center mb-12">
            <Skeleton className="h-12 w-3/4 mx-auto" />
            <Skeleton className="h-6 w-full mt-4 mx-auto" />
             <Skeleton className="h-6 w-1/2 mt-2 mx-auto" />
        </div>

        <div className="grid gap-8 max-w-3xl mx-auto">
            {[...Array(4)].map((_, index) => (
                <Card key={index} className="flex flex-col">
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <Skeleton className="h-8 w-2/3" />
                            <Skeleton className="h-10 w-10 rounded-full" />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4 flex-1">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                    </CardContent>
                    <CardContent>
                        <Skeleton className="h-6 w-1/3" />
                    </CardContent>
                </Card>
            ))}
        </div>
    </div>
  );
}
