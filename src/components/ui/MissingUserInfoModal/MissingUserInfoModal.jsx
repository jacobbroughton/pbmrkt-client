import "./MissingUserInfoModal.css"

export const MissingUserInfoModal = () => {
  return (
    <div className='modal missing-user-info'>
      <div className="header">
        <h3>Just need a little bit more info</h3>
        <p>Fill out the following fields to create new listings.</p>
      </div>
      <div className='content'>
        <form></form>
      </div>
    </div>
  );
};
