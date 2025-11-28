'use client';

import { memo } from 'react';

declare global {
    interface Window {
        adsbygoogle: any[];
    }
}

const AdBanner = memo(() => {
    // The useEffect that was causing the error has been removed.
    // The main AdSense script will now automatically find and fill this component.

    return (
        <ins
            className="adsbygoogle"
            style={{ display: 'block' }}
            data-ad-client="ca-pub-6191158195654090"
            data-ad-slot="5993831393"
            data-ad-format="auto"
            data-full-width-responsive="true"
        ></ins>
    );
});

AdBanner.displayName = 'AdBanner';

export default AdBanner;
