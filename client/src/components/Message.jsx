function Message({ message }) {
    const isBot = message.type === 'bot';
  
    return (
      <div className={`flex ${isBot ? 'justify-start' : 'justify-end'}`}>
        <div
          className={`rounded-lg px-4 py-2 max-w-[80%] whitespace-pre-line ${
            isBot ? 'bg-blue-600 text-white' : 'bg-gray-700 text-white'
          }`}
        >
          {message.text}
        </div>
      </div>
    );
  }
  
  export default Message;
  