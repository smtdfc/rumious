use swc_ecma_ast::{CallExpr, Callee, Expr, MemberProp};

pub struct DepsExtractor;

impl DepsExtractor {
    /// Extract all dependencies from an expression
    /// Rules:
    /// - a.get() => Expr::Ident(a)
    /// - a.v.get() => Expr::Member(a.v)
    /// - Returns AST expressions of objects being .get() called
    pub fn extract(expr: &Expr) -> Vec<Expr> {
        let mut deps = Vec::new();
        Self::visit_expr(expr, &mut deps);
        deps
    }

    fn visit_expr(expr: &Expr, deps: &mut Vec<Expr>) {
        match expr {
            Expr::Call(call) => {
                if Self::is_get_call(call) {
                    if let Callee::Expr(callee_expr) = &call.callee {
                        if let Expr::Member(member) = &**callee_expr {
                            deps.push(member.obj.as_ref().clone());
                        }
                    }
                } else {
                    Self::visit_call_expr(call, deps);
                }
            }
            Expr::Member(member) => {
                Self::visit_expr(&member.obj, deps);
            }
            Expr::Bin(bin) => {
                Self::visit_expr(&bin.left, deps);
                Self::visit_expr(&bin.right, deps);
            }
            Expr::Unary(unary) => {
                Self::visit_expr(&unary.arg, deps);
            }
            Expr::Cond(cond) => {
                Self::visit_expr(&cond.test, deps);
                Self::visit_expr(&cond.cons, deps);
                Self::visit_expr(&cond.alt, deps);
            }
            Expr::Array(arr) => {
                for elem in &arr.elems {
                    if let Some(elem) = elem {
                        Self::visit_expr(&elem.expr, deps);
                    }
                }
            }
            Expr::Object(obj) => {
                for prop in &obj.props {
                    match prop {
                        swc_ecma_ast::PropOrSpread::Prop(prop) => {
                            match &**prop {
                                swc_ecma_ast::Prop::KeyValue(kv) => {
                                    Self::visit_expr(&kv.value, deps);
                                }
                                swc_ecma_ast::Prop::Shorthand(_) => {
                                    // Shorthand properties don't trigger .get()
                                }
                                _ => {}
                            }
                        }
                        swc_ecma_ast::PropOrSpread::Spread(spread) => {
                            Self::visit_expr(&spread.expr, deps);
                        }
                    }
                }
            }
            _ => {}
        }
    }

    fn visit_call_expr(call: &CallExpr, deps: &mut Vec<Expr>) {
        if let Callee::Expr(expr) = &call.callee {
            Self::visit_expr(expr, deps);
        }
        for arg in &call.args {
            Self::visit_expr(&arg.expr, deps);
        }
    }

    fn is_get_call(call: &CallExpr) -> bool {
        if let Callee::Expr(expr) = &call.callee {
            if let Expr::Member(member) = &**expr {
                matches!(member.prop, MemberProp::Ident(ref ident) if ident.sym == "get")
            } else {
                false
            }
        } else {
            false
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_simple_get() {}
}
