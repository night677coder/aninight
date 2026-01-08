import React from 'react';

export default function GoogleAdSense({ 
  adSlot, 
  adFormat = 'auto', 
  className = '',
  responsive = true,
  style = { display: 'block' }
}) {
  return (
    <div className={`google-adsense ${className}`}>
      <ins
        className="adsbygoogle"
        style={style}
        data-ad-client="ca-pub-9097893369149135"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={responsive ? "true" : "false"}
      />
      <script>
        {(adsbygoogle = window.adsbygoogle || []).push({})}
      </script>
    </div>
  );
}

export function GoogleAdSenseBanner({ adSlot, className = '' }) {
  return (
    <div className={`google-adsense-banner ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: '100%', height: '90px' }}
        data-ad-client="ca-pub-9097893369149135"
        data-ad-slot={adSlot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
      <script>
        {(adsbygoogle = window.adsbygoogle || []).push({})}
      </script>
    </div>
  );
}

export function GoogleAdSenseSidebar({ adSlot, className = '' }) {
  return (
    <div className={`google-adsense-sidebar ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: '300px', height: '250px' }}
        data-ad-client="ca-pub-9097893369149135"
        data-ad-slot={adSlot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
      <script>
        {(adsbygoogle = window.adsbygoogle || []).push({})}
      </script>
    </div>
  );
}
