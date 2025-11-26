
import React, { useState, useRef, useEffect } from 'react';
import Button from './Button';
import { interactWithResource } from '../../api/resourcesAPI';

const LikeButton = ({ resourceId, initial = 0, onCounts }) => {
  const [count, setCount] = useState(initial);
  const [loading, setLoading] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  // If parent updates initial prop, keep in sync
  useEffect(() => {
    setCount(initial);
  }, [initial]);

  const handleClick = async (e) => {
    e.stopPropagation();
    if (loading) return;
    setLoading(true);
    try {
      const res = await interactWithResource(resourceId, 'like');
      const counts = res?.counts;
      if (mounted.current) {
        if (counts && typeof counts.likes === 'number') setCount(counts.likes);
        if (onCounts) onCounts(counts);
      }
    } catch (err) {
      console.error('Like failed', err);
    } finally {
      if (mounted.current) setLoading(false);
    }
  };

  return (
    <Button onClick={handleClick} className="text-xs px-2 py-1 bg-green-500 text-black hover:bg-green-600" disabled={loading}>
      👍 {count}
    </Button>
  );
};

export default React.memo(LikeButton);