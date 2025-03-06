export const getTubeCoordinates = (
  index: number,
  tubeRefs: React.RefObject<any>,
  setSelectedTubeCoordinates: React.Dispatch<React.SetStateAction<any>>
) => {
  if (tubeRefs.current[index]) {
    tubeRefs.current[index].measure(
      (
        x: number,
        y: number,
        width: number,
        height: number,
        pageX: number,
        pageY: number
      ) => {
        setSelectedTubeCoordinates({ x, y, width, height, pageX, pageY });
      }
    );
  }
};