import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Button from "../common/Button";
import Icon from "../common/Icon";
import {
  gsap,
  prefersReducedMotion,
  useGSAP,
} from "../../animations/gsap";
export default function AppShell({ children }) {
  const shell = useRef(null);
  const dialog = useRef(null);
  const main = useRef(null);
  const location = useLocation();
  const previousLocation = useRef(location);
  const { contextSafe } = useGSAP({ scope: shell });

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const timeline = gsap.timeline({
        defaults: { duration: 0.55, ease: "power3.out" },
      });
      timeline
        .from(".workspace-header", { y: -80, autoAlpha: 0 })
        .from(
          "aside.workspace-sidebar",
          { x: -36, autoAlpha: 0 },
          "-=0.35",
        );
    },
    { scope: shell },
  );

  useGSAP(
    () => {
      if (prefersReducedMotion() || !main.current) return;
      const heading = main.current.querySelector("[data-gsap-heading]");
      const cards = main.current.querySelectorAll("[data-gsap-card]");
      const timeline = gsap.timeline({
        defaults: { duration: 0.45, ease: "power3.out" },
      });
      if (heading) {
        timeline.fromTo(
          heading,
          { y: 18, autoAlpha: 0 },
          { y: 0, autoAlpha: 1 },
        );
      }
      if (cards.length) {
        timeline.fromTo(
          cards,
          { y: 22, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, stagger: 0.07 },
          heading ? "-=0.25" : 0,
        );
      }
    },
    {
      scope: shell,
      dependencies: [location.pathname],
      revertOnUpdate: true,
    },
  );

  useEffect(() => {
    const drawer = dialog.current;
    const media = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = () => {
      if (media.matches) drawer.close();
    };
    media.addEventListener("change", closeOnDesktop);
    return () => {
      media.removeEventListener("change", closeOnDesktop);
      document.body.classList.remove("overflow-hidden");
    };
  }, []);
  useEffect(() => {
    if (previousLocation.current !== location) {
      dialog.current.close();
      main.current.focus();
      window.scrollTo(0, 0);
      previousLocation.current = location;
    }
  }, [location]);

  useEffect(() => {
    const element = shell.current;
    const animatePress = contextSafe((event) => {
      if (prefersReducedMotion()) return;
      const control = event.target.closest("button, a[href]");
      if (!control || !element.contains(control) || control.matches(":disabled"))
        return;
      gsap.fromTo(
        control,
        { scale: 0.97 },
        {
          scale: 1,
          duration: 0.28,
          ease: "back.out(2.5)",
          overwrite: true,
          clearProps: "transform",
        },
      );
    });
    element.addEventListener("pointerdown", animatePress);
    return () => element.removeEventListener("pointerdown", animatePress);
  }, [contextSafe]);

  function openDrawer() {
    dialog.current.showModal();
    document.body.classList.add("overflow-hidden");
    if (!prefersReducedMotion()) {
      gsap.fromTo(
        dialog.current,
        { xPercent: -100 },
        { xPercent: 0, duration: 0.38, ease: "power3.out" },
      );
    }
  }
  function closeDrawer() {
    if (prefersReducedMotion()) {
      dialog.current.close();
      return;
    }
    gsap.to(dialog.current, {
      xPercent: -100,
      duration: 0.26,
      ease: "power2.in",
      onComplete: () => {
        dialog.current.close();
        gsap.set(dialog.current, { clearProps: "transform" });
      },
    });
  }
  function containFocus(event) {
    if (event.key !== "Tab") return;
    const controls = [
      ...dialog.current.querySelectorAll("a[href], button:not(:disabled)"),
    ].filter((element) => element.getClientRects().length > 0);
    const first = controls[0];
    const last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
  return (
    <div ref={shell} className="min-h-dvh bg-slate-50">
      <a
        href="#main-content"
        className="sr-only z-50 rounded-lg bg-white p-3 focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      <Header onOpenMenu={openDrawer} />
      <div className="lg:grid lg:grid-cols-[16rem_minmax(0,1fr)]">
        <aside className="workspace-sidebar sticky top-20 hidden h-[calc(100dvh-5rem)] overflow-y-auto border-r border-slate-800 lg:block">
          <Sidebar />
        </aside>
        <main
          id="main-content"
          ref={main}
          tabIndex={-1}
          className="workspace-main min-h-[calc(100dvh-5rem)] min-w-0 p-4 outline-none sm:p-6 lg:p-8 xl:p-10"
        >
          <div className="mx-auto max-w-7xl">
            {children}
            <footer className="mt-10 flex flex-wrap justify-between gap-2 border-t border-slate-200 pt-5 text-xs text-slate-400">
              <span>Magnus Academy · Learning workspace</span>
              <span>Full-stack portfolio project</span>
            </footer>
          </div>
        </main>
      </div>
      <dialog
        id="mobile-navigation"
        ref={dialog}
        aria-labelledby="navigation-title"
        onKeyDown={containFocus}
        onClose={() => {
          document.body.classList.remove("overflow-hidden");
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) closeDrawer();
        }}
        className="workspace-sidebar fixed inset-y-0 left-0 m-0 h-dvh max-h-none w-72 max-w-[calc(100vw-2rem)] border-0 p-0 text-slate-200 shadow-2xl backdrop:bg-slate-950/60"
      >
        <div className="flex h-full flex-col">
          <div className="flex shrink-0 items-center justify-between border-b border-white/10 p-4">
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-xl bg-indigo-500 font-bold text-white shadow-lg shadow-indigo-950/30">M</span>
              <h2 id="navigation-title" className="font-semibold text-white">
                Magnus Academy
              </h2>
            </div>
            <Button
              onClick={closeDrawer}
              aria-label="Close navigation"
              className="border-white/10 bg-white/10 text-white hover:bg-white/20"
            >
              <Icon name="close" />
            </Button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            <Sidebar
              prefix="mobile"
              onNavigate={closeDrawer}
            />
          </div>
        </div>
      </dialog>
    </div>
  );
}
