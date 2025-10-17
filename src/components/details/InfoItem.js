"use client";
import Link from 'next/link';
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function InfoItem({ icon, label, value, isProducer = true }) {
  return (
    value && (
      <div className="flex items-center gap-2 text-sm text-[#999] mb-3">
        {icon && <FontAwesomeIcon icon={icon} className="text-[#999] text-xs" />}
        <span className="font-medium">{`${label}: `}</span>
        <span className="text-[#ddd]">
          {Array.isArray(value) ? (
            value.map((item, index) =>
              isProducer ? (
                <Link
                  href={`/producer/${item.replace(/[&'"^%$#@!()+=<>:;,.?/\\|{}[\]`~*_]/g, "").split(" ").join("-").replace(/-+/g, "-")}`}
                  key={index}
                  className="hover:text-white transition duration-200"
                >
                  {item}
                  {index < value.length - 1 && ", "}
                </Link>
              ) : (
                <span key={index}>{item}{index < value.length - 1 && ", "}</span>
              )
            )
          ) : isProducer ? (
            <Link
              href={`/producer/${value.replace(/[&'"^%$#@!()+=<>:;,.?/\\|{}[\]`~*_]/g, "").split(" ").join("-").replace(/-+/g, "-")}`}
              className="hover:text-white transition duration-200"
            >
              {value}
            </Link>
          ) : (
            <span>{value}</span>
          )}
        </span>
      </div>
    )
  );
}

export default InfoItem;
