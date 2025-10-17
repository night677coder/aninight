"use client";
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function Tag({ icon, text }) {
  return (
    <div className="flex items-center px-2 py-0.5 border border-[#555] rounded text-xs text-[#ddd] bg-black/30">
      {icon && <FontAwesomeIcon icon={icon} className="text-xs mr-1.5" />}
      <p>{text}</p>
    </div>
  );
}

export default Tag;
