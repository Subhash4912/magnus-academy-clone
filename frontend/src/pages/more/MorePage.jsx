import { moreItems } from '../../utils/navigation'
import PageHeading from '../../components/common/PageHeading'
import NavigationCards from '../../components/common/NavigationCards'

export default function MorePage() {
  return (
    <>
      <PageHeading
        title="More to explore"
        description="Explore interactive React examples for common interface patterns."
      />
      <NavigationCards items={moreItems} />
    </>
  )
}
