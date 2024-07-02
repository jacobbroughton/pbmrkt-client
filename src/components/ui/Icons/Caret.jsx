export const Caret = ({ direction }) => {
  let rotateText = "";

  switch (direction) {
    case "right": {
      rotateText = "rotate(90deg)";
      break;
    }
    case "left": {
      rotateText = "rotate(-90deg)";
      break;
    }
    case "down": {
      rotateText = "rotate(180deg)";
      break;
    }
    case "up": {
      rotateText = "rotate(180deg)";

      break;
    }
    default: {
      rotateText = "rotate(180deg)";
      rotateText = "rotate(180deg)";
      break;
    }
  }
  return (
    <svg
      style={{ transform: rotateText }}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 320 512"
      className='caret'
    >
      <path d="M182.6 137.4c-12.5-12.5-32.8-12.5-45.3 0l-128 128c-9.2 9.2-11.9 22.9-6.9 34.9s16.6 19.8 29.6 19.8H288c12.9 0 24.6-7.8 29.6-19.8s2.2-25.7-6.9-34.9l-128-128z" />
    </svg>
  );
};
