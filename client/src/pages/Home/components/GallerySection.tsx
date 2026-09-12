export function GallerySection() {
  const imageList = [
    { src: "./src/assets/images/pexels-pixabay-277319.jpg", alt: "Round Skeleton Watch" },
    { src: "./src/assets/images/pexels-thefstopper-1075189.jpg", alt: "Black Coloured Chronograph Watch" },
    { src: "./src/assets/images/pexels-ferarcosn-190819.jpg", alt: "Silver And Black Round Watch" },
  ];

  return (
    <div className="bg-[#0A0A0B] border-t border-[#F2EDE4]/10">
      <div className="max-w-[1200px] mx-auto px-4 md:component-x-axis-padding py-14 md:py-20">
        <div className="flex flex-col gap-2 pb-10 md:pb-14 max-w-[520px]">
          <h2 className="text-2xl md:text-3xl text-[#F2EDE4]">Details worth a second look</h2>
          <p className="text-[#F2EDE4]/60 text-sm md:text-base leading-relaxed">
            Every piece is chosen for the small things, the weight of a case, the finish on a dial,
            the way a strap sits. These are a few we keep coming back to.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          {imageList.map((img, i) => (
            <div
              key={img.src}
              className={`relative overflow-hidden ${i === 1 ? "md:mt-10" : ""}`}
            >
              <img
                src={img.src}
                alt={img.alt}
                className="w-full h-[300px] md:h-[380px] object-cover grayscale-[15%] scale-100 transition-[filter,transform] duration-500 ease-out hover:grayscale-0 hover:scale-[1.04]"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
