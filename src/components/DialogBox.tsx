interface DialogBoxProps {
  message: string;
  speaker?: string;
}

export function DialogBox({ message, speaker }: DialogBoxProps) {
  return (
    <div className="bg-black border-2 border-[#FFD700] p-3 min-h-[80px] retro-text">
      {speaker && (
        <div className="text-[#FF4444] mb-2">* {speaker}</div>
      )}
      <div className="text-[#FFD700] leading-relaxed">
        {message}
      </div>
    </div>
  );
}