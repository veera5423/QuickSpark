import React, { useState, useRef, useEffect } from 'react';
import Button from './Button';
import { interactWithResource } from '../../api/resourcesAPI';

const DislikeButton = ({ resourceId, initial = 0, onCounts }) => {
  const [count, setCount] = useState(initial);
  const [loading, setLoading] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  useEffect(() => {
    setCount(initial);
  }, [initial]);

  const handleClick = async (e) => {
    e.stopPropagation();
    if (loading) return;
    setLoading(true);
    try {
      const res = await interactWithResource(resourceId, 'dislike');
      const counts = res?.counts;
      if (mounted.current) {
        if (counts && typeof counts.dislikes === 'number') setCount(counts.dislikes);
        if (onCounts) onCounts(counts);
      }
    } catch (err) {
      console.error('Dislike failed', err);
    } finally {
      if (mounted.current) setLoading(false);
    }
  };

  return (
    <Button onClick={handleClick} className="text-xs px-2 py-1 bg-red-500 text-black hover:bg-red-600" disabled={loading}>
      👎 {count}
    </Button>
  );
};

export default React.memo(DislikeButton);
