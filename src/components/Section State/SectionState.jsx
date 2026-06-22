import LoadingUi   from "./LoadingUi";
function SectionState({loading, error, data}) {

  if (loading) {
    return <LoadingUi />;
  }

  if (error) {
    return <div className="section-error">hey check your internet connection</div>;
  }

  if (!data?.length) {
    return <div className="section-empty">No data found.</div>;
  }
  return null;

}
export default SectionState;  