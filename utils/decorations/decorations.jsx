import React from 'react';
import { Sparkles } from 'lucide-react';

// Reusable function to render decorations on the tree
export const decoIcon = ({ iconType, isHovered }) => {
  switch (iconType) {
    case 'lantern':
      return (
        <div className={`decoration-lantern ${isHovered ? 'hovered' : ''}`}>
          <div className="lantern-top"></div>
          <div className="lantern-body"></div>
          <div className="lantern-bottom"></div>
          <div className="lantern-glow"></div>
        </div>
      );

    case 'envelope':
      return (
        <div className={`decoration-envelope ${isHovered ? 'hovered' : ''}`}>
          <div className="envelope-flap"></div>
          <div className="envelope-body">
            <span className="envelope-text">福</span>
          </div>
        </div>
      );

    case 'blossom':
      return (
        <div className={`decoration-blossom ${isHovered ? 'hovered' : ''}`}>
          <Sparkles className="blossom-sparkle" />
        </div>
      );

    default:
      return null;
  }
};
