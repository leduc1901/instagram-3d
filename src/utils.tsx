import { useEffect, useRef, useState } from "react";
import { data } from "./constant";

export const useCarousel = () => {
  const [rotateY, setRotateY] = useState(0);
  const [displayStories, setDisplayStories] = useState(data);
  const [imagePosition, setImagePosition] = useState(
    new Map(data.map((i) => [i.id, 0]))
  );
  const [cellSize, setCellSize] = useState(480);

  const [currentStory, setCurrentStory] = useState(data[0].id);
  const hold = useRef(0);
  const currentStoryRef = useRef(data[0].id);

  let isDown = false;
  let current = 0;

  const rotateYref = useRef(rotateY);

  const nextImage = () => {
    const currentStoryIndex = getCurrentIndex(currentStoryRef);
    const currentPosition = imagePosition.get(currentStoryRef.current) || 0;
    const storyLength =
      data.find((_data) => _data.id === currentStoryRef.current)?.images
        .length || 0;

    if (
      isLast(currentStoryIndex, data.length) &&
      isLast(currentPosition, storyLength)
    ) {
      return;
    }

    if (!isLast(currentPosition, storyLength)) {
      setImagePosition(
        new Map(imagePosition.set(currentStoryRef.current, currentPosition + 1))
      );
    } else {
      nextStory(currentStoryIndex);
    }
  };

  const prevImage = () => {
    const currentPosition = imagePosition.get(currentStoryRef.current) || 0;
    const currentStoryIndex = getCurrentIndex(currentStoryRef);

    if (isFirst(currentStoryIndex) && isFirst(currentPosition)) {
      return;
    }
    if (!isFirst(currentPosition)) {
      setImagePosition(
        new Map(imagePosition.set(currentStoryRef.current, currentPosition - 1))
      );
    } else {
      prevStory(currentStoryIndex);
    }
  };

  const prevStory = (currentStoryIndex: number) => {
    setCurrentStory(data[currentStoryIndex - 1].id);
    setRotateY(hold.current + 90);
    hold.current = hold.current + 90;
  };

  const nextStory = (currentStoryIndex: number) => {
    setCurrentStory(data[currentStoryIndex + 1].id);
    setRotateY(hold.current - 90);
    hold.current = hold.current - 90;
  };

  const end = () => {
    isDown = false;
    const currentStoryIndex = getCurrentIndex(currentStoryRef);
    if (rotateYref.current > hold.current && !isFirst(currentStoryIndex)) {
      prevStory(currentStoryIndex);
      return;
    }
    if (
      rotateYref.current < hold.current &&
      !isLast(currentStoryIndex, data.length)
    ) {
      nextStory(currentStoryIndex);
      return;
    }
    setRotateY(hold.current);
  };

  useEffect(() => {
    rotateYref.current = rotateY;
  }, [rotateY]);

  useEffect(() => {
    currentStoryRef.current = currentStory;
  }, [currentStory]);

  const start = (e: MouseEvent | TouchEvent) => {
    isDown = true;
    current = "pageX" in e ? e.pageX : e.touches[0].pageX;
  };

  const move = (e: MouseEvent | TouchEvent) => {
    if (!isDown) return;
    e.preventDefault();
    const dist = "pageX" in e ? e.pageX : e.touches[0].pageX;
    const threshHold = Math.abs(dist - current);
    const wrap = 3.6666666;
    if (dist >= current) {
      setRotateY(hold.current + threshHold / wrap);
    } else {
      setRotateY(hold.current - threshHold / wrap);
    }
  };

  useEffect(() => {
    const carousel = document.getElementById("carousel") || ({} as Element);

    if (window.screen.width < 480) {
      setCellSize(window.screen.width);
    }

    if (carousel) {
      carousel.addEventListener("mousedown", start as (e: Event) => void);
      carousel.addEventListener("touchstart", start as (e: Event) => void);

      carousel.addEventListener("mousemove", move as (e: Event) => void);
      carousel.addEventListener("touchmove", move as (e: Event) => void);

      carousel.addEventListener("mouseleave", end);
      carousel.addEventListener("mouseup", end);
      carousel.addEventListener("touchend", end);
    }
  }, []);

  return {
    displayStories,
    rotateY,
    nextImage,
    prevImage,
    imagePosition,
    currentStory,
    start,
    move,
    end,
    cellSize,
  };
};

function getCurrentIndex(currentStory: React.MutableRefObject<string>) {
  return data.findIndex((_data) => _data.id === currentStory.current);
}

export const isLast = (index: number, length: number) => {
  return index === length - 1;
};

export const isFirst = (index: number) => {
  return index === 0;
};
