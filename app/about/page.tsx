import Image from "next/image";

export default function AboutPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-16">
      <h1 className="mb-6 text-3xl font-semibold">About the Builder</h1>

      <hr className="mb-8 border-slate-200" />

      <div className="space-y-5 leading-relaxed text-slate-700">
        <p>Hi - I&apos;m Jacob.</p>

        <p>
          I grew up around a small-town family business and spent several years working in
          restaurants after college while building furniture on the side. My sister and
          brother-in-law now run a couple of restaurants in Durham, NC. Those experiences gave me
          a deep respect for how much work it takes to run a small business - and how much
          reputation and word-of-mouth matter.
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          <figure className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <Image
              src="/images/about/IMG_0024.jpeg"
              alt="Jacob and his pup at a national park"
              width={1200}
              height={900}
              className="h-64 w-full object-cover"
            />
            <figcaption className="px-3 py-2 text-xs text-slate-500">
              Time outside keeps me grounded and renews my energy for building stuff.
            </figcaption>
          </figure>
          <figure className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <Image
              src="/images/about/IMG_0307.jpeg"
              alt="Jacob hiking with his pup"
              width={1200}
              height={900}
              className="h-64 w-full object-cover"
            />
            <figcaption className="px-3 py-2 text-xs text-slate-500">
              My pup is my regular trail companion on weekend hikes.
            </figcaption>
          </figure>
        </div>

        <p>
          Today I work as a software developer, but I&apos;ve remained passionate about building
          practical tools that help small service businesses solve everyday problems.
        </p>

        <p>
          I&apos;ve also spent time living in communities all over the country - sometimes briefly,
          sometimes for longer stretches - including Atlanta, Nashville, Louisville, Santa Fe,
          Sedona, Los Angeles, Ojai, Asheville, Myrtle Beach, Buffalo, Hudson and Beacon (NY),
          Portland (ME), Charlotte, Bethlehem (PA), Chicago, Whitefish (MT), and Brewster (WA).
        </p>

        <p>
          Seeing both large and small communities up close has shaped how I think about local
          trust, service, and reputation.
        </p>

        <p>
          I&apos;m currently building a simple feedback tool called <strong>AttuneBridge</strong>
          designed to help businesses hear from unhappy customers before those experiences turn
          into negative public reviews.
        </p>

        <p>
          Right now I&apos;m intentionally starting small and speaking directly with business owners to
          understand what would actually be useful before building too much. At this stage, I&apos;m
          focused on learning whether this core idea is useful in real day-to-day operations before
          expanding scope.
        </p>

        <p>
          If you run a small business and would be open to sharing your experience, I&apos;d genuinely
          love to hear from you.
        </p>

        <p>
          I&apos;m not active on social media, but I&apos;m including my{" "}
          <a
            href="https://www.linkedin.com/in/jacobnlangley/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            LinkedIn
          </a>{" "}
          so you can verify my background and real-world work. Outside of work, I&apos;m usually
          hiking with my pup and exploring national parks.
        </p>

        <figure className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <Image
            src="/images/about/IMG_1528.jpeg"
            alt="Jacob and his pup during a national park trip"
            width={1600}
            height={1000}
            className="h-72 w-full object-cover sm:h-80"
          />
          <figcaption className="px-3 py-2 text-xs text-slate-500">
            Exploring national parks reminds me to build things that are steady, simple, and useful.
          </figcaption>
        </figure>
      </div>
    </main>
  );
}
