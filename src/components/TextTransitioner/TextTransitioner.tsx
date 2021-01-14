import React, { useState, useRef, useMemo, useLayoutEffect } from "react";
import memo1 from "memoize-one";
import styled from "styled-components/macro";

export interface TextTransitionerProps {
  children: string | undefined | null;
  fadeDuration?: number;
  sizeDuration?: number;
  timingFunction?: CSSStyleDeclaration["transitionTimingFunction"]
}

export function TextTransitioner({ children, ...props }: TextTransitionerProps) {
  const {
    fadeDuration,
    sizeDuration,
    timingFunction,
    ...childProps
  } = {
    // Set default props
    fadeDuration: 250,
    sizeDuration: 750,
    timingFunction: "ease",
    ...props
  };

  // The display children are used so we can control when the children are
  // displayed in the target.
  const [targetChildren, setTargetChildren] = useState(children);

  // Ref to assist with initial renders
  const firstRender = useRef<undefined | true>();

  // The mirror is where the actual children are rendered
  const mirrorRef = useRef<HTMLDivElement>(null), mirror = mirrorRef.current;

  // The target is the element where the display children are put
  const targetRef = useRef<HTMLDivElement>(null), target = targetRef.current;

  // The parent is the target's surrounding element
  const parent = useMemo(() => mirrorRef.current?.parentElement, [mirror]);

  useLayoutEffect(() => {
    // If not all DOM elements are available, bail.
    if (!mirror || !target || !parent) {
      return;
    }

    // If this is the first render and we have no children, then hide
    // the parent immediately with no animation and bail.
    if (firstRender.current === undefined) {
      firstRender.current = true;
      if (children == null || children?.length === 0) {
        parent.style.position      = "absolute";
        parent.style.pointerEvents = "none";
        parent.style.visibility    = "hidden";
        parent.style.maxWidth      = "0px";
        parent.style.zIndex        = "-1";
        return;
      }
    }

    // If target is already identical to the mirror, bail.
    if (children === targetChildren) {
      return;
    }

    // Store timeoud IDs so they can be cancelled on cleanup.
    const pending: number[] = [];

    // Animate out when given falsy children.
    if (children == null || children?.length === 0) {
      // Inline the parent's current styles
      parent.style.transition   = "all 0ms";
      parent.style.borderWidth  = gcs(parent).borderWidth;
      parent.style.height       = gcs(parent).height;
      parent.style.marginLeft   = gcs(parent).marginLeft;
      parent.style.marginRight  = gcs(parent).marginRight;
      parent.style.opacity      = gcs(parent).opacity;
      parent.style.paddingLeft  = gcs(parent).paddingLeft;
      parent.style.paddingRight = gcs(parent).paddingRight;
      parent.style.width        = gcs(parent).width;

      // Fade out
      target.style.transition = `
        opacity ${timingFunction} ${fadeDuration}ms
        width   ${timingFunction} ${sizeDuration}ms`;
      target.style.opacity = "0";

      wait(fadeDuration, () => {
        const fullDuration = sizeDuration + fadeDuration;
        // Shrink parent
        parent.style.transition = `
          border-width  ${sizeDuration}ms ${timingFunction},
          margin-left   ${sizeDuration}ms ${timingFunction},
          margin-right  ${sizeDuration}ms ${timingFunction},
          padding-left  ${sizeDuration}ms ${timingFunction},
          padding-right ${sizeDuration}ms ${timingFunction},
          width         ${sizeDuration}ms ${timingFunction}`;
        parent.style.borderWidth  = "0px";
        parent.style.marginLeft   = "0px";
        parent.style.marginRight  = "0px";
        parent.style.paddingLeft  = "0px";
        parent.style.paddingRight = "0px";
        parent.style.width        = "0px";

        wait(sizeDuration, () => {
          // Hide the shrunken parent
          parent.style.position      = "absolute";
          parent.style.pointerEvents = "none";
          parent.style.visibility    = "hidden";
          parent.style.zIndex        = "-1";

          setTargetChildren(children);

          // Clean up, restoring the target and mirror. The parent will not be
          // restored until the component is made visible.
          parent.style.removeProperty("transition");
          parent.style.removeProperty("height");
          parent.style.removeProperty("border-width");
          parent.style.removeProperty("border-width");
          parent.style.removeProperty("margin-left");
          parent.style.removeProperty("margin-right");
          parent.style.removeProperty("opacity");
          parent.style.removeProperty("padding-left");
          parent.style.removeProperty("padding-right");
          parent.style.removeProperty("width");
          target.style.removeProperty("transition");
          target.style.removeProperty("opacity");
          target.style.removeProperty("width");
        });
      });

      return done;
    }

    // Animate in when receiving new children.
    if (targetChildren == null || targetChildren?.length === 0) {
      // Reveal the parent
      if (parent.style.visibility === "hidden") {
        parent.style.removeProperty("position");
        parent.style.removeProperty("pointer-events");
        parent.style.removeProperty("visibility");
        parent.style.removeProperty("z-index");
      }

      // Put parent in zeroed state
      parent.style.transition   = "all 0ms";
      parent.style.borderWidth  = "0px";
      parent.style.marginLeft   = "0px";
      parent.style.marginRight  = "0px";
      parent.style.paddingLeft  = "0px";
      parent.style.paddingRight = "0px";
      parent.style.opacity      = "0";
      // Put target in zeroed state
      target.style.transition   = "all 0ms";
      target.style.opacity      = "0";
      target.style.width        = "0px";

      setTargetChildren(children);

      raf(() => {
        // Open and fade parent
        parent.style.transition   = `
          border-width  ${sizeDuration}ms ${timingFunction},
          margin-left   ${sizeDuration}ms ${timingFunction},
          margin-right  ${sizeDuration}ms ${timingFunction},
          opacity       ${fadeDuration}ms ${timingFunction},
          padding-left  ${sizeDuration}ms ${timingFunction},
          padding-right ${sizeDuration}ms ${timingFunction}`;
        parent.style.borderWidth  = gcs(parent).borderWidth;
        parent.style.opacity      = gcs(parent).opacity;
        parent.style.marginLeft   = gcs(parent).marginLeft;
        parent.style.marginRight  = gcs(parent).marginRight;
        parent.style.paddingLeft  = gcs(parent).paddingLeft;
        parent.style.paddingRight = gcs(parent).paddingRight;

        // Open target
        target.style.transition = `
          opacity ${fadeDuration}ms ${timingFunction},
          height  ${sizeDuration}ms ${timingFunction},
          width   ${sizeDuration}ms ${timingFunction}`;
        target.style.width      = gcs(mirror).width;
        target.style.height     = gcs(mirror).height;

        wait(sizeDuration, () => {
          // Now that the parent and target are wide enough, fade in
          target.style.opacity = "1";

          // Clean up
          wait(fadeDuration, () => {
            parent.style.removeProperty("transition");
            parent.style.removeProperty("border-width");
            parent.style.removeProperty("opacity");
            parent.style.removeProperty("margin-left");
            parent.style.removeProperty("margin-right");
            parent.style.removeProperty("padding-left");
            parent.style.removeProperty("padding-right");
            target.style.removeProperty("transition");
            target.style.removeProperty("opacity");
            target.style.removeProperty("height");
            target.style.removeProperty("width");
          });
        });
      });

      return done;
    }

    // When the children change, animate them in and out along with the parent

    // Inline the current target rules
    target.style.opacity = gcs(target).opacity;
    target.style.width   = gcs(target).width;

    raf(() => {
      // Fade the target out
      target.style.transition = `
        opacity ${timingFunction} ${fadeDuration}ms,
        width   ${timingFunction} ${sizeDuration}ms`;
      target.style.opacity = "0";

      wait(fadeDuration, () => {
        // Adjust the parent width
        target.style.width = gcs(mirror).width;

        // Set the new children on the target
        setTargetChildren(children);

        wait(sizeDuration, () => {
          // Fade the target and the new children in
          target.style.opacity = "1";

          // Clean up
          wait(fadeDuration, () => {
            target.style.removeProperty("opacity");
            target.style.removeProperty("width");
          });
        });
      });
    });

    return done;

    // Clear pending functions and transitioning styles
    function done() {
      pending.map(window.clearTimeout);
      if (parent) parent.setAttribute("style", `all ${timingFunction} ${sizeDuration}`);
      if (target) target.setAttribute("style", `all ${timingFunction} ${sizeDuration}`);
    }

    // Combination setTimeout + requestAnimationFrame
    function wait(duration: number, fn: () => void) {
      pending.push(
        window.setTimeout(() => raf(fn), duration)
      );
    }
  }, [children]);

  return <>
    <TargetDiv ref={targetRef} {...childProps}>
      {targetChildren}
    </TargetDiv>

    <MirrorDiv ref={mirrorRef} {...childProps}>
      {children}
    </MirrorDiv>
  </>
}

const TargetDiv = styled.div`
  overflow: hidden;
  white-space: pre;
`;

const MirrorDiv = styled.div`
  position: fixed;
  right: 100%;
  white-space: pre;
`;

// Private functions

const gcs = memo1(window.getComputedStyle);

const raf = window.requestAnimationFrame;
