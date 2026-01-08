"use client";
import React from 'react';
import Script from 'next/script';

export default function GoogleAdSense({ 
  adSlot, 
  adFormat = 'auto', 
  className = '',
  responsive = true,
  style = { display: 'block' }
}) {
  return (
    <div className={`google-adsense ${className}`}>
      <Script
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"
        strategy="afterInteractive"
        crossOrigin="anonymous"
      />
      <ins
        className="adsbygoogle"
        style={style}
        data-ad-client="ca-pub-9097893369149135"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={responsive ? "true" : "false"}
      />
      <Script id={`adsense-${adSlot}`} strategy="afterInteractive">
        {`(adsbygoogle = window.adsbygoogle || []).push({});`}
      </Script>
    </div>
  );
}

export function GoogleAdSenseBanner({ adSlot, className = '' }) {
  return (
    <div className={`google-adsense-banner ${className}`}>
      <Script
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"
        strategy="afterInteractive"
        crossOrigin="anonymous"
      />
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: '100%', height: '90px' }}
        data-ad-client="ca-pub-9097893369149135"
        data-ad-slot={adSlot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
      <Script id={`adsense-banner-${adSlot}`} strategy="afterInteractive">
        {`(adsbygoogle = window.adsbygoogle || []).push({});`}
      </Script>
    </div>
  );
}

export function GoogleAdSenseSidebar({ adSlot, className = '' }) {
  return (
    <div className={`google-adsense-sidebar ${className}`}>
      <Script
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"
        strategy="afterInteractive"
        crossOrigin="anonymous"
      />
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: '300px', height: '250px' }}
        data-ad-client="ca-pub-9097893369149135"
        data-ad-slot={adSlot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
      <Script id={`adsense-sidebar-${adSlot}`} strategy="afterInteractive">
        {`(adsbygoogle = window.adsbygoogle || []).push({});`}
      </Script>
    </div>
  );
}
