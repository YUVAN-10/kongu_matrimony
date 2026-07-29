import { Controller } from 'react-hook-form'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

// Small shared field wrappers used by every step component — not part of
// the module's requested file list, but necessary to avoid re-implementing
// label+input+error markup a dozen times over. Field names use RHF's
// dot-path nesting (e.g. "personal.fullName") so getValues() output already
// matches the Firestore document shape.

function fieldError(errors, name) {
  return name.split('.').reduce((acc, key) => acc?.[key], errors)
}

export function TextField({ name, label, register, errors, required, type = 'text', className, ...props }) {
  const error = fieldError(errors, name)
  return (
    <div className={className || 'space-y-1.5'}>
      <Label htmlFor={name}>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <Input
        id={name}
        type={type}
        aria-invalid={Boolean(error)}
        {...register(name, required ? { required: `${label} is required.` } : {})}
        {...props}
      />
      {error && <p className="text-xs text-destructive">{error.message}</p>}
    </div>
  )
}

export function TextAreaField({ name, label, register, rows = 4, className }) {
  return (
    <div className={className || 'space-y-1.5 sm:col-span-2'}>
      <Label htmlFor={name}>{label}</Label>
      <Textarea id={name} rows={rows} {...register(name)} />
    </div>
  )
}

export function SelectField({ name, label, control, options, placeholder = 'Select…', className }) {
  return (
    <div className={className || 'space-y-1.5'}>
      <Label htmlFor={name}>{label}</Label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Select value={field.value || ''} onValueChange={field.onChange}>
            <SelectTrigger id={name}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => {
                const value = typeof option === 'string' ? option : option.value
                const label2 = typeof option === 'string' ? option : option.label
                return (
                  <SelectItem key={value} value={value}>
                    {label2}
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        )}
      />
    </div>
  )
}

export function RadioField({ name, label, control, options, required, errors }) {
  const error = fieldError(errors, name)
  return (
    <div className="space-y-1.5">
      <Label>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <Controller
        name={name}
        control={control}
        rules={required ? { required: `${label} is required.` } : {}}
        render={({ field }) => (
          <RadioGroup value={field.value || ''} onValueChange={field.onChange} className="flex gap-4">
            {options.map((option) => (
              <div key={option.value} className="flex items-center gap-2">
                <RadioGroupItem value={option.value} id={`${name}-${option.value}`} />
                <Label htmlFor={`${name}-${option.value}`} className="font-normal">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )}
      />
      {error && <p className="text-xs text-destructive">{error.message}</p>}
    </div>
  )
}

export function StepGrid({ children }) {
  return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
}
