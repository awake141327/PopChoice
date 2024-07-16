import PopChoiceIcon from "../assets/PopChoiceIcon.png";

const Header = () => {
  return (
    <div className="flex flex-col items-center">
      <img src={PopChoiceIcon} alt="logo" />
      <h1 className="text-white text-[45px] font-bold font-display">
        Pop Choice
      </h1>
    </div>
  );
};

export default Header;
