// src/components/Header.tsx
import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { useAppStore } from '../store/useAppStore'

export default function Header() {
  const user = useAppStore(s => s.user)
  const initials =
    user.name?.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase() || 'U'

  return (
    // OPAQUE white header (no yellow can show through)
    <header className="sticky1 top-0 z-40 bg-white shadow-sm border-b border-slate-200">

      <div className="border-b border-slate-200">
        {/* Use GRID with 3 equal columns so center is truly centered */}
        <div className="mx-auto max-w-[1400px] px-4 h-12 md:h-14 grid grid-cols-3 items-center">
          {/* LEFT: logo */}
          <div className="flex items-center">
            {user.schoolLogoUrl ? (
              <img
                src={user.schoolLogoUrl}
                alt="School Logo"
                className="h-8 w-auto rounded-md object-cover"
              />
            ) : (
              <div
                className="h-8 w-8 rounded-md grid place-items-center bg-pastelBlue text-base"
                aria-label="School Logo"
                title="School Logo"
              >
                🏫
              </div>
            )}
          </div>

          {/* CENTER: perfectly centered title (independent of left/right widths) */}
          <div className="justify-self-center">
            <h1 className="text-base md:text-lg font-semibold text-slate-800 select-none">
              AI Buddy
            </h1>
          </div>

          {/* RIGHT: profile menu */}
          <div className="justify-self-end">
            <Menu as="div" className="relative">
              <Menu.Button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 shadow-soft hover:bg-slate-50">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-pastelGreen text-[11px] font-semibold text-slate-800">
                  {initials}
                </span>
                <span className="hidden sm:inline text-sm font-medium max-w-[140px] truncate">
                  {user.name}
                </span>
                <ChevronDownIcon className="h-4 w-4 text-slate-600" />
              </Menu.Button>

              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items
  className="absolute right-0 mt-2 w-56 origin-top-right rounded-2xl border border-slate-200 bg-white shadow-soft focus:outline-none z-[60]"
>
                  <div className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.name}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-pastelGreen grid place-items-center text-xs font-semibold text-slate-800">
                          {initials}
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-sm">{user.name}</div>
                        <div className="text-xs text-slate-500">Student</div>
                      </div>
                    </div>

                    <div className="rounded-xl bg-slate-50 border p-2 space-y-1 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Section</span>
                        <span className="font-medium">{user.section}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Class</span>
                        <span className="font-medium">{user.className}</span>
                      </div>
                    </div>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div>
      </div>
    </header>
  )
}
