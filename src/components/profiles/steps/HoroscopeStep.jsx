import { useState } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { Sparkles, Info } from 'lucide-react'
import ProfileSection from '@/components/profiles/ProfileSection'
import HoroscopeChart from '@/components/profiles/HoroscopeChart'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function HoroscopeStep() {
  const { control } = useFormContext()
  const [activeTab, setActiveTab] = useState('rasi') // 'rasi' | 'amsam' | 'both'

  return (
    <div className="space-y-6">
      <ProfileSection
        title="ஜாதகக் கட்டம் (Horoscope Chart)"
        description="இராசி மற்றும் அம்சகம் கட்டங்களில் கிரகங்களை இழுத்து வைக்கவும் (Drag & drop or tap planets to place in the 12 houses)."
      >
        {/* Helper Banner */}
        <div className="flex items-start gap-2.5 rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs text-foreground sm:text-sm">
          <Info className="size-4 text-primary shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-semibold text-primary tamil-text">வழிகாட்டுதல் (Instructions):</p>
            <p className="text-muted-foreground text-xs tamil-text">
              மேலே உள்ள கிரகங்களை தொட்டு அல்லது இழுத்து விரும்பும் கட்டத்தில் வைக்கலாம். ஒரு கட்டத்திலிருந்து மற்றொரு கட்டத்திற்கு கிரகங்களை நகர்த்தலாம்.
            </p>
          </div>
        </div>

        {/* Tab switch for mobile and compact view */}
        <div className="flex items-center justify-center gap-2 border-b border-border/80 pb-3 pt-1">
          <Button
            type="button"
            size="sm"
            variant={activeTab === 'rasi' ? 'default' : 'outline'}
            onClick={() => setActiveTab('rasi')}
            className={cn(
              'rounded-full px-4 text-xs font-semibold',
              activeTab === 'rasi' ? 'shadow-xs' : 'text-muted-foreground'
            )}
          >
            <span className="tamil-text">இராசி கட்டம் (Rasi Chart)</span>
          </Button>

          <Button
            type="button"
            size="sm"
            variant={activeTab === 'amsam' ? 'default' : 'outline'}
            onClick={() => setActiveTab('amsam')}
            className={cn(
              'rounded-full px-4 text-xs font-semibold',
              activeTab === 'amsam' ? 'shadow-xs' : 'text-muted-foreground'
            )}
          >
            <span className="tamil-text">அம்சகம் கட்டம் (Amsam Chart)</span>
          </Button>

          <Button
            type="button"
            size="sm"
            variant={activeTab === 'both' ? 'default' : 'outline'}
            onClick={() => setActiveTab('both')}
            className={cn(
              'hidden lg:inline-flex rounded-full px-4 text-xs font-semibold',
              activeTab === 'both' ? 'shadow-xs' : 'text-muted-foreground'
            )}
          >
            <span className="tamil-text">இரண்டும் (Side-by-Side)</span>
          </Button>
        </div>

        {/* Charts Container */}
        <div
          className={cn(
            'grid gap-8 pt-2',
            activeTab === 'both' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
          )}
        >
          {/* Rasi Chart */}
          {(activeTab === 'rasi' || activeTab === 'both') && (
            <div className="space-y-2 flex flex-col items-center">
              <div className="flex items-center gap-2 font-heading font-bold text-base text-foreground">
                <Sparkles className="size-4 text-primary" />
                <h4 className="tamil-text">இராசி கட்டம் (Rasi Chart)</h4>
              </div>
              <Controller
                name="astrology.rasiChart"
                control={control}
                render={({ field }) => (
                  <HoroscopeChart
                    value={field.value}
                    onChange={(val) => {
                      field.onChange(val)
                    }}
                    title="இராசி"
                  />
                )}
              />
            </div>
          )}

          {/* Amsam Chart */}
          {(activeTab === 'amsam' || activeTab === 'both') && (
            <div className="space-y-2 flex flex-col items-center">
              <div className="flex items-center gap-2 font-heading font-bold text-base text-foreground">
                <Sparkles className="size-4 text-primary" />
                <h4 className="tamil-text">அம்சகம் கட்டம் (Amsam Chart)</h4>
              </div>
              <Controller
                name="astrology.amsamChart"
                control={control}
                render={({ field }) => (
                  <HoroscopeChart
                    value={field.value}
                    onChange={field.onChange}
                    title="அம்சகம்"
                  />
                )}
              />
            </div>
          )}
        </div>
      </ProfileSection>
    </div>
  )
}