export const ME_QUERY = `
{
  me {
    _id
    name
    email
    picture
  }  
}
`

export const GET_PINS_QUERY= `
  {
    getPins {
      _id
      content
      title
      image
      latitude
      longitude
      createdAt
      author {
        _id
        name
        email
        picture
      }
      comments {
        text
        createdAt
        author {
          _id
          name
          email
          picture          
        }
      }
    }
  }
`