import { Button, Container } from "@mantine/core";

const Hero = () => {
  return (
    <section
      className="
  min-h-screen
  bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900
  flex items-center justify-center
  relative overflow-hidden
"
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl animate-pulse" />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500 rounded-full filter blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <Container size="xl" className="text-center relative z-10">
        <h1
          className="
      text-6xl sm:text-8xl lg:text-9xl
      font-black tracking-tight
      bg-gradient-to-r from-white via-purple-200 to-pink-200
      bg-clip-text text-transparent
      mb-8 animate-fadeInUp
    "
        >
          THE FUTURE
        </h1>

        <p
          className="
      text-xl sm:text-2xl lg:text-3xl
      text-white/80 max-w-4xl mx-auto
      mb-12 leading-relaxed
      animate-fadeInUp
    "
          style={{ animationDelay: "0.3s" }}
        >
          Where design meets innovation and users fall in love at first sight
        </p>

        <Button
          size="xl"
          radius="xl"
          className="
        px-16 py-6 text-2xl
        bg-gradient-to-r from-purple-600 to-pink-600
        hover:from-purple-500 hover:to-pink-500
        transform hover:scale-110 active:scale-95
        transition-all duration-200
        shadow-2xl hover:shadow-purple-500/25
        animate-fadeInUp
      "
          style={{ animationDelay: "0.6s" }}
        >
          Experience Magic ✨
        </Button>
      </Container>
    </section>
  );
};

export default Hero;