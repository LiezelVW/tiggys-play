import type { Rive } from "@rive-app/canvas";
import { tiggyActions, tiggyRig, type TiggyAction } from "./tiggyRig";
export type TiggyRenderer = {
  trigger: (action: TiggyAction) => void;
  pause: () => void;
  resume: () => void;
  dispose: () => void;
};
/** No runtime or .riv fetch while the author's exported rig is unavailable. */
export async function mountTiggyRig(
  canvas: HTMLCanvasElement,
  signal: AbortSignal,
  source: string | null = tiggyRig.src,
): Promise<TiggyRenderer | undefined> {
  if (
    !source ||
    signal.aborted ||
    matchMedia("(prefers-reduced-motion: reduce)").matches
  )
    return;
  const { Rive, RuntimeLoader, Layout, Fit, Alignment, StateMachineInputType } =
    await import("@rive-app/canvas");
  if (signal.aborted) return;
  RuntimeLoader.setWasmUrl(tiggyRig.wasm);
  return new Promise((resolve, reject) => {
    let runtime: Rive | undefined,
      settled = false,
      disposed = false;
    const timeout = setTimeout(
      () => fail(new Error("Tiggy rig load timed out")),
      15000,
    );
    function dispose() {
      if (disposed) return;
      disposed = true;
      clearTimeout(timeout);
      signal.removeEventListener("abort", abort);
      runtime?.cleanup();
    }
    function fail(error: Error) {
      dispose();
      if (!settled) {
        settled = true;
        reject(error);
      }
    }
    function abort() {
      dispose();
      if (!settled) {
        settled = true;
        resolve(undefined);
      }
    }
    signal.addEventListener("abort", abort, { once: true });
    try {
      runtime = new Rive({
        canvas,
        src: source!,
        artboard: tiggyRig.artboard,
        stateMachine: tiggyRig.stateMachine,
        autoBind: true,
        autoplay: true,
        enableRiveAssetCDN: false,
        shouldDisableRiveListeners: true,
        layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }),
        onLoadError: () =>
          fail(new Error("Unable to load the exported Tiggy rig")),
        onLoad: () => {
          if (disposed || !runtime) return;
          if (!runtime.stateMachineNames.includes(tiggyRig.stateMachine)) {
            fail(new Error("Missing TiggyController state machine"));
            return;
          }
          const bound = new Map<TiggyAction, () => void>();
          for (const name of tiggyActions) {
            const modern = runtime.viewModelInstance?.trigger(name);
            const legacy = runtime
              .stateMachineInputs(tiggyRig.stateMachine)
              ?.find(
                (input) =>
                  input.name === name &&
                  input.type === StateMachineInputType.Trigger,
              );
            if (modern) bound.set(name, () => modern.trigger());
            else if (legacy) bound.set(name, () => legacy.fire());
            else {
              fail(new Error(`Missing Tiggy trigger: ${name}`));
              return;
            }
          }
          clearTimeout(timeout);
          runtime.resizeDrawingSurfaceToCanvas();
          bound.get("Idle")!();
          settled = true;
          resolve({
            trigger: (name) => {
              if (!disposed) bound.get(name)?.();
            },
            pause: () => {
              if (!disposed) runtime?.stopRendering();
            },
            resume: () => {
              if (!disposed) runtime?.startRendering();
            },
            dispose,
          });
        },
      });
    } catch (error) {
      fail(
        error instanceof Error
          ? error
          : new Error("Rive initialization failed"),
      );
    }
  });
}
