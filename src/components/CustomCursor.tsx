import { useEffect, useRef } from "react";

const CustomCursor = () => {
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const dotRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const supportsFinePointer = window.matchMedia("(pointer: fine)").matches;
    if (!supportsFinePointer) return;

    const cursor = cursorRef.current;
    const dot = dotRef.current;

    if (!cursor || !dot) return;

    let mouseX = 0;
    let mouseY = 0;
    let dotX = 0;
    let dotY = 0;
    let cursorX = 0;
    let cursorY = 0;

    let isHovering = false;
    let frameId = 0;

    // 🔥 Color fijo orange-500
    cursor.style.borderColor = "#f97316"; // tailwind orange-500
    dot.style.backgroundColor = "#f97316";


   /* const observer = new MutationObserver(applyTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });*/

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const handleHover = (e: Event) => {
      const target = e.target as HTMLElement;

      if (
        target.closest("button") ||
        target.closest("a") ||
        target.closest(".cursor-hover")
      ) {
        isHovering = true;
        cursor.style.borderWidth = "3px";
      }
    };

    const handleLeave = () => {
      isHovering = false;
      cursor.style.borderWidth = "2px";
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseover", handleHover);
    document.addEventListener("mouseout", handleLeave);

    const animate = () => {
      dotX += (mouseX - dotX) * 0.35;
      dotY += (mouseY - dotY) * 0.35;
      dot.style.transform = `translate(${dotX - 1}px, ${dotY - 1}px)`;

      cursorX += (dotX - cursorX) * 0.15;
      cursorY += (dotY - cursorY) * 0.15;

      cursor.style.transform = `
        translate(${cursorX - 24}px, ${cursorY - 24}px)
        ${isHovering ? "scale(1.6)" : "scale(1)"}
      `;

      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameId);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseover", handleHover);
      document.removeEventListener("mouseout", handleLeave);
    };
  }, []);

  return (
    <>
      <div
        ref={cursorRef}
        className="pointer-events-none fixed left-0 top-0 z-[9999]
                   h-12 w-12 rounded-full border-2
                   transition-all duration-200 ease-out
                   hidden md:block"
      />
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-[9999]
                   h-2 w-2 rounded-full
                   hidden md:block"
      />
    </>
  );
};

export default CustomCursor;
