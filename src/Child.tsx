import React from "react";

export default function Child({ parentToChild, childToParent }) {
  const message = "Bring this string to the parent";
  return (
    <>
      <div>Number of clicks from the parent: [{parentToChild}]</div>
      <div>
        <button onClick={() => childToParent(message)}>
          Show Child Message
        </button>
      </div>
    </>
  );
}
