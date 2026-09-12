export default function AboutUs() {
  const reasons = [
    { title: "Built to last", body: "Cases and movements chosen for durability, not just looks." },
    { title: "A range for every budget", body: "From everyday pieces to the ones you save up for." },
    { title: "Delivered to your door", body: "Anytime, day or night, we don't keep office hours." },
    { title: "Simple returns", body: "3 days from delivery, no questions asked." },
    { title: "Your data stays yours", body: "We only ever ask for what's needed to get your order to you." },
  ];

  return (
    <div id="about-us" className="bg-[#0A0A0B] text-[#F2EDE4] border-t border-[#F2EDE4]/10">
      <div className="max-w-[1200px] mx-auto px-4 md:component-x-axis-padding py-16 md:py-24 grid md:grid-cols-[1fr_1.2fr] gap-12 md:gap-20">
        <div className="flex flex-col gap-5">
          <h2 className="text-3xl md:text-4xl">About us</h2>
          <p className="text-[#F2EDE4]/70 text-base md:text-lg leading-relaxed">
            The Watch Store started with a simple idea: good watches shouldn't require a lecture
            on movements and lug widths to enjoy. We pick pieces that are durable, honestly priced,
            and worth wearing every day then get them to you - without the fuss.
          </p>
        </div>

        <div className="flex flex-col">
          <h3 className="text-xl md:text-2xl pb-4">Why choose us</h3>
          <ul className="flex flex-col">
            {reasons.map((r) => (
              <li key={r.title} className="py-5 border-t border-[#F2EDE4]/10 last:border-b">
                <p className="text-base md:text-lg">{r.title}</p>
                <p className="text-sm md:text-base text-[#F2EDE4]/55 mt-1">{r.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
