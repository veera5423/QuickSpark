import React from 'react';
import { Github, Linkedin, Globe, Mail } from 'lucide-react';

const SocialLink = ({ href, label, icon: Icon }) => {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white/60 hover:bg-white transition-colors text-slate-800"
      aria-label={label}
      title={label}
    >
      <Icon className="w-4 h-4 text-teal-700" />
      <span className="text-sm font-semibold">{label}</span>
    </a>
  );
};

const DeveloperProfile = ({
  name,
  role,
  tagline,
  avatarSrc,
  githubUrl,
  linkedinUrl,
  websiteUrl,
  email
}) => {
  return (
    <section className="rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-r from-teal-600 to-amber-400 flex items-center justify-center text-white font-black text-xl shadow">
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt={`${name} avatar`}
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <span>{(name || '?').split(' ').map((p) => p[0]).slice(0, 2).join('')}</span>
              )}
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-slate-950">{name}</h2>
              <p className="text-slate-600">{role}</p>
              {tagline ? <p className="text-sm text-slate-500 mt-1">{tagline}</p> : null}
            </div>
          </div>

          <div className="flex flex-col sm:items-end gap-2">
            <SocialLink href={githubUrl} label="GitHub" icon={Github} />
            <SocialLink href={linkedinUrl} label="LinkedIn" icon={Linkedin} />
            <SocialLink href={websiteUrl} label="Website" icon={Globe} />
            <SocialLink href={email ? `mailto:${email}` : null} label="Email" icon={Mail} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default DeveloperProfile;

