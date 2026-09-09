import PageHeading from '../common/PageHeading'
import Card from '../common/Card'

export default function ModulePage({
  title,
  description,
  children,
  card = true,
}) {
  return (
    <>
      <PageHeading title={title} description={description} eyebrow="More" />
      {card ? <Card>{children}</Card> : children}
    </>
  )
}
