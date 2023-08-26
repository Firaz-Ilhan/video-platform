import React, {ReactNode, ButtonHTMLAttributes} from 'react'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faSpinner} from '@fortawesome/free-solid-svg-icons'

interface LoadingButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading: boolean
  loadingText?: string
  loadingIcon?: ReactNode
}

const LoadingButton: React.FC<LoadingButtonProps> = ({
  isLoading,
  children,
  loadingText = 'Loading...',
  loadingIcon = <FontAwesomeIcon icon={faSpinner} spin />,
  ...props
}) => {
  return (
    <button
      {...props}
      disabled={isLoading}
      aria-busy={isLoading ? 'true' : 'false'}>
      {isLoading ? (
        <span>
          {loadingIcon} {loadingText}
        </span>
      ) : (
        children
      )}
    </button>
  )
}

export {LoadingButton}
