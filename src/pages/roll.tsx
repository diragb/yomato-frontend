// Packages:
import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import localforage from 'localforage'
import axios from 'axios'
import { useToast } from 'src/components/ui/use-toast'
import millify from 'millify'
import { sample, throttle } from 'lodash'
import { cn } from 'src/lib/utils'

// Typescript:
import type { Food, Restaurant, Section } from '../types/menu'
import type { APIResponse } from '../types'

// Imports:
import VegIcon from 'src/components/primary/VegIcon'
import NonVegIcon from 'src/components/primary/NonVegIcon'
import { GitHubLogoIcon, HeartFilledIcon } from '@radix-ui/react-icons'

// Components:
import { Ratings } from 'src/components/ui/ratings'
import { Input } from 'src/components/ui/input'
import { TypeAnimation } from 'react-type-animation'
import { ScrollArea } from 'src/components/ui/scroll-area'

// Functions:
const Roll = () => {
  // Constants:
  const { toast } = useToast()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const cityID = searchParams.get('city')
  const restaurantID = searchParams.get('restaurant')

  // State:
  const [isLoadingRestaurant, setIsLoadingMenu] = useState(false)
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [couldNotFetchRestaurant, setCouldNotFetchRestaurant] = useState(false)
  const [budget, setBudget] = useState<number | null>(null)
  const [foods, setFoods] = useState<Food[] | null>(null)
  const [filteredFoods, setFilteredFoods] = useState<Food[]>([])
  const [typeAnimationFinished, setTypeAnimationFinished] = useState(false)

  // Functions:
  const getCachedRestaurant = async (cityID: string, restaurantID: string): Promise<Restaurant | null> => {
    const restaurantsInCity = await localforage.getItem(cityID) as Record<string, Restaurant> | null

    if (!restaurantsInCity) return null
    if (Object.keys(restaurantsInCity).length === 0) return null
    if (!restaurantsInCity[restaurantID]) return null
    return restaurantsInCity[restaurantID]
  }

  const fetchRestaurant = async (cityID: string, restaurantID: string) => {
    try {
      setIsLoadingMenu(true)
      const cachedRestaurant = await getCachedRestaurant(cityID, restaurantID)
      if (cachedRestaurant) {
        setRestaurant(cachedRestaurant)
        return
      }

      const response = (await axios.get(
        process.env['REACT_APP_API_ENDPOINT'] + '/restaurant',
        {
          params: {
            city: cityID,
            restaurant: restaurantID,
          }
        }
      )).data as APIResponse<Restaurant>
      if (response.status === 'error') throw new Error(response.message)
      if (response.data) {
        setRestaurant(response.data)
        const restaurantsInCity = await localforage.getItem(cityID) as Record<string, Restaurant> | null

        if (
          !restaurantsInCity ||
          Object.keys(restaurantsInCity).length === 0 ||
          !restaurantsInCity[restaurantID]
        ) {
          await localforage.setItem(cityID, {
            ...(restaurantsInCity ?? {}),
            [restaurantID]: response.data,
          })
        }
      }
    } catch (error) {
      toast({
        title: 'Something went wrong.. :(',
        description: (error as unknown as Error).message || 'Please try again later!',
        variant: 'destructive',
      })
      setCouldNotFetchRestaurant(true)
    } finally {
      setIsLoadingMenu(false)
    }
  }

  const getAllFoodItemsFromMenu = (menu: Section[]) => {
    try {
      menu.forEach(menuItem => {
        menuItem.subSections.forEach(subSection => {
          setFoods(_foods => [...(_foods === null ? [] : _foods), ...subSection.foods])
        })
      })
    } catch (error) {
      toast({
        title: 'Something went wrong.. :(',
        description: (error as unknown as Error).message || 'Please try again later!',
        variant: 'destructive',
      })
    }
  }

  const getFilteredFoods = useCallback(throttle(async (budget: number) => {
    if (foods === null) setFilteredFoods([])
    else {
      let totalPrice = 0, trials = 0
      const suggestedFoods: Food[] = []
      const sortedEligibleFoods = foods
        .filter(food => food.price <= budget)
        .sort((foodA, foodB) => foodA.price - foodB.price)
      
      while (totalPrice < budget && trials <= 20) {
        trials++
        const randomFood = sample(sortedEligibleFoods)
        if (!randomFood) continue
        const newTotalPrice = totalPrice + randomFood.price
        if (newTotalPrice > budget) continue
        else {
          totalPrice = newTotalPrice
          suggestedFoods.push(randomFood)
        }
      }
      
      setFilteredFoods(suggestedFoods)
    }
  }, 250), [foods])

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Tight budget and an empty stomach?',
          text: 'Check out Yomato, you can enter your budget and it\'ll recommend food from your favorite restaurants.',
          url: 'https://yomato.app',
        });
      } catch (error) {
        toast({
          title: 'Something went wrong!',
          description: 'Please try again later',
          variant: 'destructive',
        })
      }
    } else {
      toast({
        title: 'Web Share API is not supported in your browser!',
        variant: 'destructive',
      })
    }
  }

  // Effects:
  useEffect(() => {
    if (cityID === null || restaurantID === null) navigate('/search')
    else if (!isLoadingRestaurant && restaurant == null && !couldNotFetchRestaurant) fetchRestaurant(cityID, restaurantID)
  }, [
    cityID,
    restaurantID,
    isLoadingRestaurant,
    restaurant,
    couldNotFetchRestaurant,
    fetchRestaurant,
    navigate,
  ])

  useEffect(() => {
    if (
      restaurant !== null && restaurant.menu && foods === null
    ) getAllFoodItemsFromMenu(restaurant.menu)
  }, [restaurant, foods])
  
  // Return:
  return (
    <>
      <div className='fixed top-0 left-0 z-10 flex justify-between items-center w-screen h-12 sm:h-16 px-4 sm:px-10 bg-white shadow-md'>
        <div className='w-4 sm:w-5'>
          <GitHubLogoIcon
            className='w-4 sm:w-5 h-4 sm:h-5 text-zinc-700 opacity-1 md:opacity-0 cursor-pointer'
            onClick={() => window.open('https://github.com/diragb', '_blank')}
          />
        </div>
        <div className='pt-sans-bold-italic text-lg sm:text-3xl text-rose-600 leading-none'>yomato</div>
        <div>
          <HeartFilledIcon
            className='w-4 sm:w-5 h-4 sm:h-5 text-rose-600 opacity-1 md:opacity-0 cursor-pointer'
            onClick={handleShare}
          />
        </div>
      </div>
      <ScrollArea className='h-screen w-full'>
        <main className='flex items-center flex-col w-[calc(100vw-20px)] sm:w-auto mx-[10px] xl:mx-[300px] 2xl:mx-[450px] pt-4 mt-12 sm:mt-20 text-zinc-900'>
          <div className='relative w-full h-40 sm:h-96 rounded-md overflow-hidden'>
            <div
              className='w-full h-full bg-cover bg-center bg-no-repeat'
              style={{
                backgroundImage: `url(${ restaurant?.image })`,
              }}
            />
          </div>
          <div className='flex justify-between items-start w-full mt-4'>
            <div className='flex flex-col gap-2 w-auto sm:max-w-[75%]'>
              <h1 className='text-2xl font-bold sm:text-4xl sm:font-semibold'>{restaurant?.name}</h1>
              <p className='text-xs sm:text-sm font-medium text-zinc-500'>{restaurant?.address}</p>
            </div>
            <div className='w-auto max-w-[25%] hidden sm:block'>
              {
                restaurant?.rating.value && (
                  <div className='flex justify-center items-center gap-1 select-none'>
                    <Ratings
                      rating={restaurant?.rating.value}
                      variant='yellow'
                      size={14}
                      className='gap-1'
                    />
                    <div className='text-xs text-zinc-500 leading-none'>({ millify(restaurant?.rating.votes) })</div>
                  </div>
                )
              }
            </div>
          </div>
          {
            (!restaurant?.menu && !isLoadingRestaurant) && (
              <div className='flex justify-center items-center w-full py-3 mt-3 text-sm font-semibold text-yellow-700 bg-amber-200 rounded-md'>
                😓 This restaurant doesn't have a menu!
              </div>
            )
          }
          {
            (restaurant?.menu && !isLoadingRestaurant) && (
              <>
                <div className='flex flex-col gap-1 sm:gap-6 w-full mt-4 sm:mt-10'>
                  <Input
                    type='text'
                    className='w-fit p-0 border-none text-lg sm:text-4xl'
                    inputClassName={cn(
                      'min-w-10 p-0 font-semibold underline transition-opacity delay-300',
                      typeAnimationFinished ? 'opacity-1' : 'opacity-0',
                    )}
                    autoFocus
                    startAdornmentClassName='p-0 text-lg sm:text-4xl'
                    startAdornment={
                      <div className='relative'>
                        <div className='text-zinc-600 opacity-0'>My budget is ₹</div>
                        <TypeAnimation
                          sequence={[
                            'My budget is ₹',
                            () => setTypeAnimationFinished(true),
                          ]}
                          wrapper='div'
                          speed={{
                            type: 'keyStrokeDelayInMs',
                            value: 20
                          }}
                          className='absolute top-0 text-zinc-600'
                          cursor={false}
                        />
                      </div>
                    }
                    value={budget || 0}
                    onChange={event => {
                      const newBudget = parseFloat(event.target.value || '0')
                      setBudget(newBudget)
                      getFilteredFoods(newBudget)
                    }}
                  />
                  <div
                    className={cn(
                      'flex gap-2 mb-4 text-lg sm:text-4xl text-zinc-600 transition-opacity duration-300 delay-200',
                      budget === null ? 'opacity-0' : 'opacity-1'
                    )}
                  >
                    Here's what you can afford..
                    <div
                      className={cn(
                        'font-bold select-none cursor-pointer transition-opacity duration-300 delay-700',
                        budget === null ? 'opacity-0' : 'opacity-1'
                      )}
                      onClick={() => getFilteredFoods(budget || 0)}
                    >
                      <span className='text-zinc-800 transition-colors hover:text-rose-600'>
                        Reroll?
                      </span>
                    </div>
                  </div>
                  {
                    filteredFoods.map((filteredFood, index) => (
                      <div
                        key={index}
                        className={cn(
                          'flex flex-row w-full mb-6',
                          filteredFood.thumbnail ? 'gap-4' : 'items-start gap-2',
                        )}
                      >
                        <div
                          className={cn(
                            filteredFood.thumbnail ? 'relative w-32 h-32 rounded-lg overflow-hidden' : ''
                          )}
                        >
                          {
                            filteredFood.thumbnail ? (
                              <>
                                <div
                                  className='w-full h-full bg-cover bg-center bg-no-repeat'
                                  style={{
                                    backgroundImage: `url(${ filteredFood.thumbnail as string })`
                                  }}
                                />
                                <div className='absolute z-1 top-2 right-2 bg-white rounded-sm'>
                                  {
                                    filteredFood.type === 'non-veg' ? (
                                      <NonVegIcon />
                                    ) : (
                                      <VegIcon />
                                    )
                                  }
                                </div>
                              </>
                            ) : (
                              <div className='bg-white rounded-sm'>
                                {
                                  filteredFood.type === 'non-veg' ? (
                                    <NonVegIcon />
                                  ) : (
                                    <VegIcon />
                                  )
                                }
                              </div>
                            )
                          }
                        </div>
                        <div
                          className={cn(
                            'flex items-start flex-col',
                            filteredFood.thumbnail ? 'gap-2 w-[calc(100%-8.5rem)]' : 'gap-1 w-[calc(100%-0.25rem)]',
                          )}
                        >
                          <h3 className='font-medium text-lg leading-none'>{filteredFood.name}</h3>
                          {
                            filteredFood.rating.votes && (
                              <div className='flex justify-center items-center gap-1 select-none'>
                                <Ratings
                                  rating={filteredFood.rating.value}
                                  variant='yellow'
                                  size={14}
                                  className='gap-1'
                                />
                                <div className='text-xs text-zinc-500 leading-none'>{ millify(filteredFood.rating.votes) } reviews</div>
                              </div>
                            )
                          }
                          <p className='text-sm'>₹{filteredFood.price}</p>
                          <p className='text-sm text-zinc-600'>{filteredFood.description}</p>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </>
            )
          }
        </main>
      </ScrollArea>
    </>
  )
}

// Exports:
export default Roll
