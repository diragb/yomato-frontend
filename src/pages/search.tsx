// Packages:
import { useState } from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useToast } from 'src/components/ui/use-toast'
import { createSearchParams, useNavigate } from 'react-router-dom'
import { cn } from 'src/lib/utils'

// Components:
import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from 'src/components/ui/form'
import { Input } from 'src/components/ui/input'
import { Button } from 'src/components/ui/button'
import { ClipboardIcon } from '@radix-ui/react-icons'

// Functions:
const Search = () => {
  // Constants:
  const { toast } = useToast()
  const navigate = useNavigate()
  const ZOMATO_URL_REGEX = /^https:\/\/www\.zomato\.com\/([a-zA-Z]+)\/([a-zA-Z0-9-]+)(?:\/[a-zA-Z0-9-]+)?$/
  const schema = z.object({
    zomatoRestaurantURL: z.string()
      .min(23, 'The URL is too short!')
      .max(150, 'The URL is too long!')
      .regex(ZOMATO_URL_REGEX, "The URL doesn't seem quite right.."),
  })

  // State:
  const [isSearching, setIsSearching] = useState(false)
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      zomatoRestaurantURL: '',
    },
    mode: 'all',
  })
  const zomatoRestaurantURL = form.watch('zomatoRestaurantURL')

  // Functions:
  const onSubmit = async (values: z.infer<typeof schema>) => {
    try {
      setIsSearching(true)

      const match = values.zomatoRestaurantURL.match(ZOMATO_URL_REGEX)
      if (!match) throw new Error("The URL doesn't seem quite right..")

      const city = match[1]
      const restaurant = match[2]
      navigate({
        pathname: 'roll',
        search: createSearchParams({
          city,
          restaurant,
        }).toString()
    })
    } catch (error) {
      toast({
        title: 'Something went wrong.. :(',
        description: (error as unknown as Error).message || "Please try again later!",
        variant: 'destructive',
      })
    } finally {
      setIsSearching(false)
    }
  }

  // Return:
  return (
    <main className='flex justify-center items-center flex-col w-screen h-screen'>
      <div className='flex justify-center items-center flex-col w-5/6 sm:w-2/6'>
        <h2 className='text-4xl sm:text-7xl pt-sans-bold-italic text-pink-600'>yomato</h2>
        <div className='flex flex-col gap-1 mt-6'>
          <div className='text-zinc-900 font-medium'>1. Open <a className='font-bold text-pink-600 hover:underline' target='_blank' href='https://www.zomato.com/'>Zomato's website</a> and copy any restaurant's link</div>
          <div className='text-zinc-900 font-medium'>2. Paste it below and search 🚀</div>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col gap-2 w-full max-w-md mt-4'>
            <div className='flex justify-center items-center w-full items-center space-x-2'>
              <FormField
                control={form.control}
                name='zomatoRestaurantURL'
                render={({ field }) => (
                  <FormItem className='w-full'>
                    <FormControl className='w-full'>
                      <Input
                        placeholder='https://www.zomato.com/bangalore/the-global-huts-devanahalli'
                        type='url'
                        className={cn(
                          'w-full',
                          !!form.formState.errors.zomatoRestaurantURL && '',
                        )}
                        endAdornmentClassName='pl-0'
                        endAdornment={
                          <ClipboardIcon
                            className='w-5 h-5 cursor-pointer'
                            onClick={async () => {
                              try {
                                const text = await navigator.clipboard.readText()
                                form.setValue('zomatoRestaurantURL', text)
                                form.trigger('zomatoRestaurantURL')
                              } catch (error) {
                                toast({
                                  title: 'Could not get clipboard contents!',
                                  variant: 'destructive',
                                })
                              }
                            }}
                          />
                        }
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button
                type='submit'
                disabled={
                  isSearching ||
                  !!form.formState.errors.zomatoRestaurantURL ||
                  zomatoRestaurantURL.trim().length === 0
                }
                className='bg-pink-600 hover:bg-pink-500'
              >
                Search
              </Button>
            </div>
            {
              !!form.formState.errors.zomatoRestaurantURL && (
                <p className='text-xs font-medium text-rose-600'>{ form.formState.errors.zomatoRestaurantURL?.message }</p>
              )
            }
          </form>
        </Form>
      </div>
    </main>
  )
}

// Exports:
export default Search
