interface Props {
    onSelect: (emoji: string) => void;
}

const emojis = ["😀", "😃", "😄", "😁", "😆", "😂", "🤣", "😊", "🙂", "😉", "😍", "🥰", "😘", "😎", "🤔", "😅", "😭", "😡", "👍", "👎", "👏", "🙏", "❤️", "🔥", "🎉", "🚀", "💯", "✅", "❌", "⭐"];

const EmojiPicker = ({ onSelect }: Props) => {
    return (
        <div className="absolute bottom-12 left-0 z-30 grid w-64 animate-fade-in grid-cols-6 gap-1 rounded-xl border border-primary/20 bg-white p-3 shadow-lg">
            {emojis.map((emoji) => (
                <button key={emoji} onClick={() => onSelect(emoji)} className="flex h-9 w-9 items-center justify-center rounded-lg text-xl hover:bg-secondary/60 transition-colors">
                    {emoji}
                </button>
            ))}
        </div>
    );
};

export default EmojiPicker;