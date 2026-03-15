// import { clampHandlers } from '../utils/clampers';
// import type { WindowBounds, WindowOb } from '../Window';

// export function useClampTargetOnResizeEnd(windowOb: WindowOb) {
//     const { contentArea } = useContentArea();

//     watch(
//         () => windowOb.states.resize !== true,
//         (v) => {
//             if (!v) return;
//             for (const key in windowOb.boundsTarget) {
//                 const typedKey = key as keyof WindowBounds;
//                 const clamper = clampHandlers[typedKey];

//                 windowOb.boundsTarget[typedKey] = clamper(
//                     windowOb.boundsTarget[typedKey],
//                     windowOb.boundsTarget,
//                     contentArea.value.width,
//                     contentArea.value.height,
//                 );

//                 console.log(windowOb.boundsTarget[typedKey]);
//             }
//         },
//     );
// }
