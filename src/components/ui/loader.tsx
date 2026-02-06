const Loader = () => (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <span className="text-muted-foreground">Loading...</span>
    </div>
);

export { Loader };
