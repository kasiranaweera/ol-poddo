import React, { useState } from 'react'
import { Link } from 'react-router-dom'

// A lightweight Navigation Menu styled similarly to shadcn/ui NavigationMenu
// Left column: list of subjects. Right column: resource types (Past Papers, Textbooks, Notes) for selected subject.

export const NavigationMenu = ({ subjects = [], resourceTypes = [] }) => {
  const [selected, setSelected] = useState(subjects[0] || null)

  return (
    <div className="w-full border border-border rounded-lg bg-card overflow-hidden">
      <div className="grid grid-cols-3 md:grid-cols-4 gap-0">
        {/* Subjects column */}
        <div className="col-span-1 border-r border-border bg-background/50 p-4">
          <h4 className="text-sm font-semibold mb-3">Subjects</h4>
          <ul className="space-y-2">
            {subjects.map((s) => (
              <li key={s.id}>
                <button
                  onClick={() => setSelected(s)}
                  className={`w-full text-left px-3 py-2 rounded-md transition-colors text-sm ${
                    selected && selected.id === s.id
                      ? 'bg-amber-500 text-white'
                      : 'text-muted-foreground hover:bg-muted/50'
                  }`}
                >
                  {s.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Resource types / content column */}
        <div className="col-span-2 md:col-span-3 p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold">{selected ? selected.name : 'Select a subject'}</h3>
              <p className="text-sm text-muted-foreground mt-1">Choose a resource type to browse available materials.</p>
            </div>
            {selected && (
              <Link
                to={`/resources/${selected.slug}`}
                className="text-sm font-medium text-primary hover:underline"
              >
                View all {selected.name}
              </Link>
            )}
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {resourceTypes.map((rt) => (
              <div key={rt.key} className="p-4 border rounded-lg border-border bg-background/50">
                <h4 className="font-semibold mb-2">{rt.title}</h4>
                <p className="text-sm text-muted-foreground mb-3">{rt.description}</p>
                <ul className="space-y-2 text-sm">
                  {(selected ? (selected.resources || {})[rt.key] : rt.examples)?.slice(0,5).map((item, idx) => (
                    <li key={idx} className="truncate">
                      <Link to={item.href || '#'} className="text-muted-foreground hover:text-primary">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
                <div className="pt-3">
                  <Link to={`/${rt.key}`} className="text-sm text-amber-500 hover:underline">
                    See more
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
