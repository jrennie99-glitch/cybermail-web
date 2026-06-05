import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="relative border-t border-white/5 bg-bg-elev/30">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <span className="inline-flex h-9 w-9 rounded-lg overflow-hidden ring-1 ring-cyber-cyan/30">
                <Image
                  src="/icon-512.png"
                  alt="Cybrmail"
                  width={36}
                  height={36}
                  className="object-cover w-full h-full"
                />
              </span>
              <span className="font-display font-semibold text-lg">Cybrmail</span>
            </div>
            <p className="text-sm text-ink-dim max-w-xs leading-relaxed">
              Encrypted email + AI brain + wallet identity + real US postal
              mailbox. Built by AR Dynamics Inc, Florida.
            </p>
          </div>

          <FooterCol
            title="Product"
            links={[
              ["Features", "#features"],
              ["AI Brain", "#brain"],
              ["Wallet", "#wallet"],
              ["Postal", "#postal"],
              ["Pricing", "#pricing"],
            ]}
          />

          <FooterCol
            title="Company"
            links={[
              ["About", "/about"],
              ["Press kit", "/press"],
              ["Contact", "mailto:support@cybrmail.net"],
              ["X / Twitter", "https://x.com/cybrmail"],
            ]}
          />

          <FooterCol
            title="Legal"
            links={[
              ["Privacy policy", "/privacy"],
              ["Terms of service", "/terms"],
              ["Support", "/support"],
              ["Cookie policy", "/cookies"],
              ["Status", "https://status.cybrmail.net"],
            ]}
          />
        </div>

        <div className="mt-14 pt-8 border-t border-white/5 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between text-xs text-ink-mute font-mono">
          <div>© 2026 AR Dynamics Inc. All rights reserved.</div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-cyber-cyan/70 animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-cyber-cyan" />
            </span>
            All systems operational
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: [string, string][];
}) {
  return (
    <div>
      <div className="font-mono text-xs uppercase tracking-[0.18em] text-cyber-cyan/80 mb-5">
        {title}
      </div>
      <ul className="space-y-2.5">
        {links.map(([label, href]) => (
          <li key={label}>
            {href.startsWith("/") ? (
              <Link href={href} className="text-sm text-ink-dim hover:text-ink transition-colors">
                {label}
              </Link>
            ) : (
              <a href={href} className="text-sm text-ink-dim hover:text-ink transition-colors">
                {label}
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
