// @ts-nocheck

const anonymousAssignment = identity => identity;

array.filter(member => member.include('S'));

fundsCalls
    .filter((item) => item.index !== original.index)
    .map((item, index) => ({ ...item, index }));

Promise.all(
  budgets.map((budget) => 
    checkAccountingPeriodDivide(budget._id, accountingPeriodId))
).then((checkedBudgets) => {
  this.setState({ checkedBudgets });
})

Promise.all(
  budgets.map((budget) =>
    checkAccountingPeriodDivide(budget._id)
    .checkAccountingPeriodDivide(budget._id, accountingPeriodId))
).then((checkedBudgets) => {
  this.setState({ checkedBudgets });
})

Promise.all(
    budgets.map((budget) => 
      checkAccountingPeriodDivide(budget._id, accountingPeriodId)
    )
).then((checkedBudgets) => {
    this.setState({ checkedBudgets });
})

Promise.all(
    budgets.map((budget) => 
        checkAccountingPeriodDivide(budget._id)
        .checkAccountingPeriodDivide(budget._id, accountingPeriodId)
    )
).then((checkedBudgets) => {
    this.setState({ checkedBudgets });
})

const SearchInput = (props: any) => {
  // value state
  const [value, setValue] = useState('')
  console.debug('lp ~ file: index.tsx:19 ~ SearchInput ~ value:', value)

  const _search = () => {
    props.onSearch(value)
  }
  return (
    <div className={cxBind('box')}>
      <Search
        background="#f2f3f5"
        className={cxBind('search')}
        value={value}
        onChange={(_)=>{
          _ // Here, if using control+option+L, it will be generated at the top of the file.
        }}
        clearable
        onClear={() => {
          setValue('')
        }}
        onSearch={_search}
        leftIcon={null}
        clearIcon={<Close />}
        rightIcon={<SearchIcon onClick={_search} />}
      />
    </div>
  )
}