import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { AxiosResponse } from 'axios'
import {
  Button,
  CssBaseline,
  Link,
  Grid,
  Typography,
  Container,
  CircularProgress,
} from '@material-ui/core'
import { setActiveCourse } from '../../Admin/CourseList/CourseListSlice'
import StyledTextField from '../../../components/StyledTextField'
import HeaderRegistration from '../../../components/HeaderRegistration'
import { useAppDispatch, fetchCoursesAndSort } from '../../../hooks'
import useSnackbar from '../../../hooks/useSnackbar'
import { api } from '../../../api'
import useStyles from './LogIn.style'
import { FormValues, loginResponseData } from './types'

export interface LogInProps {
  onLogin?: Function
}

export default function SignIn({ onLogin }: LogInProps) {
  const classes = useStyles()
  const appDispatch = useAppDispatch()
  const { showError } = useSnackbar()
  const [form, setForm] = useState({ email: '', password: '' })
  const [invalidEmail, setInvalidEmail] = useState(false)
  const [invalidPasswd, setInvalidPasswd] = useState(false)
  const [loading, setLoading] = useState(false)

  const history = useHistory()
  const routeChange = () => {
    const path = '/home'
    history.push(path)
  }

  const setResponseDataToLocalStorage = ({
    data,
  }: AxiosResponse<loginResponseData>) => {
    const userId = data?.['_id']
    const userType = data?.['type']

    localStorage.setItem('id', userId)
    localStorage.setItem('type', String(userType))
  }

  const validateForm = () => {
    const validEmailLength = !!form.email.length
    setInvalidEmail(!validEmailLength)

    const validPasswordLength = !!form.password.length
    setInvalidPasswd(!validPasswordLength)

    return validEmailLength && validPasswordLength
  }

  const handleFormChange = (
    e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm((prevState) => ({
      ...prevState,
      [e.currentTarget.name]: e.currentTarget.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)
    try {
      const response = await api.post<FormValues, loginResponseData>(
        'login',
        form,
      )
      setResponseDataToLocalStorage(response)
      const courses = await fetchCoursesAndSort()
      const mostRecentCourse = courses[0]
      appDispatch(setActiveCourse(mostRecentCourse))
      routeChange()
      if (onLogin) onLogin()
    } catch (error) {
      showError(error?.response.data.message || 'Error while trying to sign in')
    }
    setLoading(false)
  }

  useEffect(() => {
    if (invalidEmail || invalidPasswd) validateForm()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form])

  return (
    <div>
      <HeaderRegistration />
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <div className={classes.paper}>
          <Typography component="h1" variant="h5">
            Sign in
          </Typography>
          <form className={classes.form} onSubmit={handleSubmit} noValidate>
            <StyledTextField
              margin="normal"
              label="Email Address"
              name="email"
              autoComplete="email"
              value={form.email}
              onChange={handleFormChange}
              autoFocus
              data-testid="li-email"
              error={invalidEmail}
              helperText={invalidEmail && 'Email address is required!'}
            />
            <StyledTextField
              margin="normal"
              name="password"
              label="Password"
              type="password"
              autoComplete="current-password"
              value={form.password}
              onChange={handleFormChange}
              data-testid="li-password"
              error={invalidPasswd}
              helperText={invalidPasswd && 'Pasword is required!'}
            />
            {!loading ? (
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                className={classes.submit}
                data-testid="li-button"
              >
                Sign In
              </Button>
            ) : (
              <CircularProgress color="primary" className={classes.submit} />
            )}
            <Grid container>
              <Grid item xs>
                <Link href="/resetpassword" variant="body2" color="inherit">
                  Forgot password?
                </Link>
              </Grid>
              <Grid item>
                <Link href="/registration" variant="body2" color="inherit">
                  {"Don't have an account? Sign Up"}
                </Link>
              </Grid>
            </Grid>
          </form>
        </div>
      </Container>
    </div>
  )
}
